import { NextResponse } from "next/server";

/**
 * La richiesta: chi vuole Movijoy scrive, e noi rispondiamo.
 *
 * È l'azione della pagina principale. Decisione di Lorenzo del 13
 * ottobre 2026: Movijoy si vende con un contatto — «chiedono, voi
 * fate» — e l'azione è un modulo in pagina, non un rimando.
 *
 * ⚠️ DUE COSE SUCCEDONO, E LA PRIMA È QUELLA CHE CONTA. La richiesta
 * viene scritta nella tabella `richieste_movijoy` del progetto Supabase
 * di chelivello (supabase/47 in quel repository): è la copia che non
 * si perde. Poi parte un avviso per posta a chi risponde. Se la posta
 * fallisce la richiesta c'è lo stesso; se il database fallisce si
 * risponde errore, perché una richiesta che non è da nessuna parte è
 * una persona che aspetta per niente.
 *
 * ⚠️ NESSUNA LIBRERIA: due fetch. Questo sito non ha il client di
 * Supabase e non lo vuole per una tabella sola; la REST di Supabase con
 * la chiave di servizio basta, e il codice resta leggibile.
 *
 * ⚠️ CONTRO I ROBOT, SENZA UN SERVIZIO ESTERNO: un campo nascosto che
 * un umano non compila (`sito`) e un tempo minimo dal caricamento del
 * modulo. Non ferma un attacco mirato; ferma gli script che riempiono
 * tutti i moduli del mondo. Se un giorno arriva spam vero, il punto in
 * cui aggiungere Turnstile è segnato sotto.
 *
 * Variabili d'ambiente del progetto Vercel di movijoy:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — il progetto di chelivello
 *   RESEND_API_KEY, RICHIESTE_A — l'avviso per posta (facoltativi)
 *
 * ⚠️ NIENTE `export const dynamic` QUI. Lo scaffold di Next 16 accende
 * `cacheComponents` in next.config.ts, e quella configurazione rifiuta
 * la direttiva di segmento: la rotta rispondeva 500 su qualunque
 * richiesta, GET compresa, prima ancora di leggere il corpo. Una POST
 * che scrive su un database è dinamica per natura e non ha bisogno di
 * dichiararlo.
 */

const TEMPO_MINIMO_MS = 3000;
const MASSIMO = { nome: 120, email: 200, messaggio: 2000 };

function pulisci(v: unknown, max: number): string {
  return String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);
}

function emailValida(e: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
}

function sfuggi(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export async function POST(req: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ errore: "richiesta illeggibile" }, { status: 400 });
  }

  /* Il campo trappola: un umano non lo vede e non lo compila. Chi lo
     compila riceve un «ok» e la richiesta sparisce — dire di no a un
     robot gli insegna cosa cambiare. */
  if (pulisci(corpo.sito, 50)) return NextResponse.json({ ok: true });

  /* Troppo in fretta per essere una persona che ha letto il modulo. */
  const aperto = Number(corpo.aperto ?? 0);
  if (!aperto || Date.now() - aperto < TEMPO_MINIMO_MS) {
    return NextResponse.json({ ok: true });
  }

  const nome = pulisci(corpo.nome, MASSIMO.nome);
  const email = pulisci(corpo.email, MASSIMO.email).toLowerCase();
  const messaggio = pulisci(corpo.messaggio, MASSIMO.messaggio);
  const chiGrezzo = pulisci(corpo.chi, 20);
  const chi = chiGrezzo === "piattaforma" || chiGrezzo === "privato" ? chiGrezzo : null;
  const origine = pulisci(corpo.origine, 200) || null;

  if (!emailValida(email)) {
    return NextResponse.json({ errore: "Serve un indirizzo email a cui rispondere." }, { status: 400 });
  }
  /* ⚠️ IL NOME NON È OBBLIGATORIO, e il motivo è la targa nel primo
     schermo: chiede la sola email, perché chi ha fretta lascia quella
     e basta — e un'email senza nome è comunque una persona a cui
     rispondere. Il modulo completo in fondo alla pagina il nome lo
     chiede; qui non si rifiuta nessuno per averlo saltato. */

  /* ⚠️ QUI, se un giorno serve Turnstile: verificare corpo.turnstile
     contro https://challenges.cloudflare.com/turnstile/v0/siteverify
     con TURNSTILE_SECRET, e rifiutare se non passa. Oggi non c'è una
     chiave per movijoy.it e il modulo deve funzionare lo stesso. */

  /* ⚠️ DUE NOMI PER L'INDIRIZZO. Su chelivello la variabile si chiama
     NEXT_PUBLIC_SUPABASE_URL e chi copia le variabili da là a qua copia
     quel nome: dal 13 al 15 ottobre 2026 il modulo in produzione ha
     risposto 503 a tutti per questo. L'indirizzo non è un segreto;
     la chiave di servizio sì, e ha un nome solo. */
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chiave) {
    console.error("richiesta: Supabase non configurato —", !url ? "manca l'indirizzo" : "manca la chiave di servizio");
    return NextResponse.json(
      { errore: "Il modulo non è ancora collegato. Scrivi a principale@chelivello.it." },
      { status: 503 },
    );
  }

  const salvata = await fetch(`${url.replace(/\/$/, "")}/rest/v1/richieste_movijoy`, {
    method: "POST",
    headers: {
      apikey: chiave,
      Authorization: `Bearer ${chiave}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ nome: nome || null, email, chi, messaggio: messaggio || null, origine }),
  });

  if (!salvata.ok) {
    console.error("richiesta: Supabase", salvata.status, (await salvata.text()).slice(0, 200));
    return NextResponse.json(
      { errore: "Non sono riuscito a salvare la richiesta. Riprova, o scrivi a principale@chelivello.it." },
      { status: 502 },
    );
  }

  /* L'avviso: parte dopo il salvataggio e non può farlo fallire. */
  const resend = process.env.RESEND_API_KEY;
  const a = process.env.RICHIESTE_A;
  if (resend && a) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resend}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Movijoy <richieste@movijoy.it>",
          to: [a],
          reply_to: email,
          subject: `Richiesta Movijoy — ${nome || email}${chi ? ` (${chi})` : ""}`,
          html: `<p><b>${sfuggi(nome || "(senza nome)")}</b> &lt;${sfuggi(email)}&gt;${chi ? ` · ${sfuggi(chi)}` : ""}</p><p>${sfuggi(messaggio || "(nessun messaggio)").replace(/\n/g, "<br>")}</p><p style="color:#888">origine: ${sfuggi(origine ?? "—")}</p>`,
        }),
      });
    } catch (e) {
      console.error("richiesta: avviso non partito", e);
    }
  }

  return NextResponse.json({ ok: true });
}
