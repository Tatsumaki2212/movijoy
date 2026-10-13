/**
 * La voce di Movijoy: la sintesi vocale del browser.
 *
 * ⚠️ WEB SPEECH API, ZERO COSTI E ZERO FILE. Ogni browser moderno ha
 * una sintesi vocale con voci italiane già installate (Windows: Elsa
 * e Cosimo; iPhone: Alice; Chrome: le voci Google). La qualità cambia
 * da dispositivo a dispositivo, e non è «la voce di Movijoy» ma la
 * voce del telefono di chi ascolta. Il giorno in cui servirà una voce
 * sua, identica ovunque, si sostituisce la funzione `di` con una
 * chiamata a un servizio (ElevenLabs, Azure) e il resto del sito non
 * cambia: tutto passa da qui.
 *
 * ⚠️ PARTE SOLO DOPO UN GESTO. I browser non fanno parlare una pagina
 * che nessuno ha toccato: la prima frase ha bisogno di un clic sulla
 * stessa pagina (o di una navigazione interna con <Link>, che conserva
 * il gesto). Per questo il dialogo ha un tasto «Voce», e chi arriva da
 * fuori lo accende lì. Se la voce è bloccata, non succede niente: il
 * testo scritto c'è lo stesso.
 *
 * ⚠️ SOLO VOCI ITALIANE. Un testo italiano letto da una voce inglese è
 * peggio del silenzio: se non c'è una voce italiana, si tace.
 */

const CHIAVE = "movijoy:voce";

export function voceDisponibile(): boolean {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}

/** Lo vuole, chi ascolta? Per impostazione sì; la scelta resta nel browser. */
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

/* Le voci migliori prima, per nome; poi qualunque voce italiana. */
const PREFERITE = ["elsa", "cosimo", "google italiano", "alice", "federica", "luca", "paola", "isabella"];

export function voceItaliana(): SpeechSynthesisVoice | null {
  if (!voceDisponibile()) return null;
  const italiane = window.speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith("it"));
  if (!italiane.length) return null;
  for (const p of PREFERITE) {
    const v = italiane.find((x) => x.name.toLowerCase().includes(p));
    if (v) return v;
  }
  return italiane[0];
}

let corrente: SpeechSynthesisUtterance | null = null;

/**
 * Dice una frase. Torna la funzione per interromperla.
 *
 * Le voci arrivano in modo asincrono al primo caricamento: se l'elenco è
 * vuoto si aspetta `voiceschanged` (o mezzo secondo, il primo che
 * arriva). Gli eventi di una frase vecchia, annullata da una nuova, non
 * contano: si ascolta solo l'ultima.
 */
export function di(
  testo: string,
  su: { alInizio?: () => void; allaFine?: () => void } = {},
): () => void {
  if (!voceDisponibile()) {
    su.allaFine?.();
    return () => {};
  }
  const sintesi = window.speechSynthesis;
  sintesi.cancel();
  let annullata = false;

  const parla = () => {
    if (annullata) return;
    const voce = voceItaliana();
    if (!voce) {
      su.allaFine?.();
      return;
    }
    const u = new SpeechSynthesisUtterance(testo);
    u.voice = voce;
    u.lang = voce.lang || "it-IT";
    u.rate = 1;
    u.pitch = 1;
    corrente = u;
    u.onstart = () => {
      if (corrente === u) su.alInizio?.();
    };
    u.onend = () => {
      if (corrente === u) su.allaFine?.();
    };
    u.onerror = () => {
      if (corrente === u) su.allaFine?.();
    };
    sintesi.speak(u);
  };

  if (sintesi.getVoices().length) {
    parla();
  } else {
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

  return () => {
    annullata = true;
    if (corrente) corrente = null;
    sintesi.cancel();
  };
}
