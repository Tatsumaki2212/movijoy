import type { IdFrase } from "./dialogo-frasi";

/**
 * La voce di Movijoy. Due strade, nell'ordine:
 *
 * 1. LA VOCE VERA, da /api/voce (ElevenLabs), se il sito ha la chiave:
 *    identica su ogni dispositivo, da doppiaggio. Costa a carattere, e
 *    per questo il server pronuncia solo le frasi del suo copione.
 * 2. LA SINTESI DEL BROWSER (Web Speech API), se la prima non c'è o
 *    non risponde: gratis, ma è la voce del telefono di chi ascolta.
 *    Si preferiscono le voci «neurali» online di Edge e Chrome, che
 *    sono molto meglio di quelle di sistema; solo voci italiane, o si
 *    tace.
 *
 * ⚠️ TUTTE E DUE PARTONO SOLO DOPO UN GESTO: i browser non fanno
 * suonare una pagina che nessuno ha toccato. Il dialogo ha il tasto
 * «Voce», e i collegamenti interni conservano il clic.
 */

const CHIAVE = "movijoy:voce";

export type Richiesta = { id: IdFrase; nome?: string; chi?: string; email?: string };
type Eventi = { alInizio?: () => void; allaFine?: () => void };

export function voceDisponibile(): boolean {
  return typeof window !== "undefined" && ("speechSynthesis" in window || "Audio" in window);
}

export function vocePreferita(): boolean {
  try {
    return localStorage.getItem(CHIAVE) !== "0";
  } catch {
    return true;
  }
}

export function ricordaVoce(accesa: boolean): void {
  try {
    localStorage.setItem(CHIAVE, accesa ? "1" : "0");
  } catch {}
}

/* Fra le voci del browser: prima le neurali online (Edge «Natural»,
   Chrome «Google»), poi le migliori di sistema, poi qualunque italiana. */
const PREFERITE = ["natural", "online", "google", "alice", "elsa", "cosimo", "federica", "luca", "paola"];

export function voceItaliana(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const italiane = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("it"));
  if (!italiane.length) return null;
  for (const p of PREFERITE) {
    const v = italiane.find((x) => x.name.toLowerCase().includes(p));
    if (v) return v;
  }
  return italiane[0];
}

let audioCorrente: HTMLAudioElement | null = null;
let sintesiCorrente: SpeechSynthesisUtterance | null = null;

function fermaTutto() {
  if (audioCorrente) {
    audioCorrente.pause();
    audioCorrente = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    sintesiCorrente = null;
    window.speechSynthesis.cancel();
  }
}

function conBrowser(testo: string, su: Eventi): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    su.allaFine?.();
    return;
  }
  const sintesi = window.speechSynthesis;
  const parla = () => {
    const voce = voceItaliana();
    if (!voce) {
      su.allaFine?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(testo);
    u.voice = voce;
    u.lang = voce.lang || "it-IT";
    u.rate = 1.02;
    u.pitch = 1;
    sintesiCorrente = u;
    u.onstart = () => {
      if (sintesiCorrente === u) su.alInizio?.();
    };
    u.onend = u.onerror = () => {
      if (sintesiCorrente === u) su.allaFine?.();
    };
    sintesi.speak(u);
  };
  if (sintesi.getVoices().length) parla();
  else {
    const t = window.setTimeout(parla, 600);
    sintesi.addEventListener(
      "voiceschanged",
      () => {
        window.clearTimeout(t);
        parla();
      },
      { once: true },
    );
  }
}

/**
 * Dice una frase: prima prova la voce vera, poi quella del browser.
 * Torna la funzione per interromperla.
 */
export function di(richiesta: Richiesta, testo: string, su: Eventi = {}): () => void {
  fermaTutto();
  let annullata = false;
  const fine = () => {
    if (!annullata) su.allaFine?.();
  };

  (async () => {
    try {
      const r = await fetch("/api/voce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(richiesta),
      });
      if (annullata) return;
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      if (annullata) return;
      const audio = new Audio(URL.createObjectURL(blob));
      audioCorrente = audio;
      audio.onplay = () => {
        if (audioCorrente === audio && !annullata) su.alInizio?.();
      };
      audio.onended = audio.onerror = () => {
        if (audioCorrente === audio) {
          URL.revokeObjectURL(audio.src);
          audioCorrente = null;
          fine();
        }
      };
      await audio.play();
    } catch {
      /* Niente voce vera (chiave assente, rete, autoplay bloccato): la
         voce del browser, se c'è. */
      if (!annullata) conBrowser(testo, su);
    }
  })();

  return () => {
    annullata = true;
    fermaTutto();
  };
}
