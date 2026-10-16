import { SITO, NOME_SITO, NOME_CHELIVELLO } from "./sito";
import { CONFIGURAZIONE_TESTO, MENSILE_TESTO, PIU_IVA } from "./prezzi-testo";

/**
 * La posta di Movijoy privato, da Resend.
 *
 * ⚠️ IL MITTENTE È UN INDIRIZZO VERIFICATO SU RESEND (MITTENTE_EMAIL,
 * oggi un indirizzo @chelivello.it): finché il dominio movijoy.it non
 * è verificato lì, una lettera «da movijoy.it» non parte. Il nome
 * mostrato resta Movijoy.
 *
 * `manda` non solleva mai: torna false, e chi chiama decide. Qui le
 * lettere portano la password per entrare: chi chiama DEVE guardare
 * l'esito, altrimenti la persona ha pagato e non entra.
 */

export const postaConfigurata = Boolean(process.env.RESEND_API_KEY && process.env.MITTENTE_EMAIL);

export async function manda({
  a,
  oggetto,
  html,
  rispondiA,
}: {
  a: string;
  oggetto: string;
  html: string;
  /** A chi arriva la risposta se chi riceve preme «rispondi»: per gli avvisi a Lorenzo, la persona che ha scritto. */
  rispondiA?: string;
}): Promise<boolean> {
  const chiave = process.env.RESEND_API_KEY;
  const mittente = process.env.MITTENTE_EMAIL;
  if (!chiave || !mittente) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${NOME_SITO} <${mittente.replace(/^.*<|>.*$/g, "")}>`,
        to: [a],
        subject: oggetto,
        html,
        ...(rispondiA ? { reply_to: rispondiA } : {}),
      }),
    });
    if (!r.ok) console.error("posta:", r.status, (await r.text()).slice(0, 200));
    return r.ok;
  } catch (e) {
    console.error("posta:", e instanceof Error ? e.message : e);
    return false;
  }
}

function sfuggi(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function guscio(corpo: string): string {
  return `<!doctype html><html lang="it"><body style="margin:0;padding:32px 16px;background:#f3f5f8;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#16233a">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:6px;padding:32px 28px;line-height:1.55">
<p style="margin:0 0 20px;font-size:12px;letter-spacing:.2em;text-transform:uppercase;font-weight:800;color:#16233a">Movijoy<span style="color:#c8102e">.</span></p>
${corpo}
<p style="margin:28px 0 0;font-size:12px;color:#6b7280">${NOME_CHELIVELLO} S.r.l. · Genova · <a href="${SITO}" style="color:#6b7280">${SITO.replace(/^https?:\/\//, "")}</a></p>
</div></body></html>`;
}

function tasto(link: string, testo: string): string {
  return `<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#c8102e;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:4px">${testo}</a></p>`;
}

function credenziali(email: string, password: string | null): string {
  return (
    `<table style="margin:18px 0;border-collapse:collapse;font-size:15px"><tr><td style="padding:6px 14px 6px 0;color:#6b7280">Nome utente</td><td style="padding:6px 0"><b>${sfuggi(email)}</b></td></tr>` +
    (password
      ? `<tr><td style="padding:6px 14px 6px 0;color:#6b7280">Password temporanea</td><td style="padding:6px 0"><b style="font-family:Consolas,Menlo,monospace;font-size:17px;letter-spacing:1px">${sfuggi(password)}</b></td></tr>`
      : "") +
    `</table>`
  );
}

/** Il benvenuto: con la password temporanea se l'account è nuovo, altrimenti con quella che la persona ha già. */
export function letteraBenvenuto({ email, password, nome }: { email: string; password: string | null; nome?: string | null }) {
  return {
    oggetto: "Il tuo Movijoy è attivo: nome utente e password",
    html: guscio(
      `<p>${nome ? `${sfuggi(nome)}, il` : "Il"} tuo Movijoy è attivo. Si entra da <a href="${SITO}/entra" style="color:#16233a">${SITO.replace(/^https?:\/\//, "")}/entra</a> con questi dati:</p>` +
        credenziali(email, password) +
        (password
          ? `<p>Al primo accesso ti chiedo di scegliere una password tua: quella qui sopra vale solo per entrare la prima volta.</p>`
          : `<p>Hai già un account ${NOME_CHELIVELLO} con questa email: la password è la stessa. Se non la ricordi, da <a href="${SITO}/entra" style="color:#16233a">entra</a> puoi chiederne una nuova.</p>`) +
        tasto(`${SITO}/entra`, "Entra nel tuo Movijoy") +
        `<p>Dentro ti faccio cinque domande su come scrivi, e poi è tuo.</p>`,
    ),
  };
}

/* ── Il dialogo della pagina principale ──────────────────────────── */

/** A chi ha risposto «per me»: Movijoy si attiva da solo, ecco il tasto.
    Nessuno gli scrive a mano (Lorenzo, 16 ottobre 2026): la lettera è
    il seguito, e la cassa è la porta. */
export function letteraAttiva({ nome }: { nome?: string | null }) {
  const chi = nome ? sfuggi(nome.split(" ")[0]) : null;
  return {
    oggetto: "Il tuo Movijoy: si attiva da solo, ecco come",
    html: guscio(
      `<p>${chi ? `Ciao ${chi}, grazie` : "Grazie"} per le risposte. Movijoy per te non aspetta nessuno: si attiva dal sito, con la carta, e in pochi minuti è tuo.</p>` +
        `<table style="margin:18px 0;border-collapse:collapse;font-size:15px"><tr><td style="padding:6px 14px 6px 0;color:#6b7280">Configurazione, una volta</td><td style="padding:6px 0"><b>${CONFIGURAZIONE_TESTO}</b> ${PIU_IVA}</td></tr><tr><td style="padding:6px 14px 6px 0;color:#6b7280">Manutenzione, ogni mese</td><td style="padding:6px 0"><b>${MENSILE_TESTO}</b> ${PIU_IVA}, senza vincolo</td></tr></table>` +
        `<p>Il totale con l'IVA lo vedi alla cassa, prima di pagare. Dentro ti faccio cinque domande su come scrivi, e la chiamata di configurazione di quaranta minuti con una persona di ${NOME_CHELIVELLO} è compresa.</p>` +
        tasto(`${SITO}/privato`, "Attiva il tuo Movijoy") +
        `<p style="font-size:13px;color:#6b7280">Se hai una domanda prima di attivarlo, rispondi a questa email: arriva a una persona.</p>`,
    ),
  };
}

/** A chi ha risposto «per la mia piattaforma»: qui non si compra dal sito, qualcuno lo contatta. */
export function letteraRicevuta({ nome }: { nome?: string | null }) {
  const chi = nome ? sfuggi(nome.split(" ")[0]) : null;
  return {
    oggetto: "Le tue risposte sono arrivate",
    html: guscio(
      `<p>${chi ? `Ciao ${chi}, grazie` : "Grazie"} per le risposte. Movijoy per una piattaforma si fa su accordo: una persona di ${NOME_CHELIVELLO} le legge e ti contatta, di solito in giornata.</p>` +
        `<p>Intanto, se vuoi vederlo di nuovo al lavoro: <a href="${SITO}/all-opera" style="color:#16233a">${SITO.replace(/^https?:\/\//, "")}/all-opera</a>.</p>`,
    ),
  };
}

/** L'avviso a chi risponde, per ogni richiesta. */
export function avvisoRichiesta({
  nome,
  email,
  chi,
  messaggio,
  origine,
}: {
  nome: string;
  email: string;
  chi: string | null;
  messaggio: string;
  origine: string | null;
}) {
  return {
    oggetto: `Richiesta Movijoy — ${nome || email}${chi ? ` (${chi})` : ""}`,
    html: guscio(
      `<p><b>${sfuggi(nome || "(senza nome)")}</b> &lt;${sfuggi(email)}&gt;${chi ? ` · ${sfuggi(chi)}` : ""}</p>` +
        `<p>${sfuggi(messaggio || "(nessun messaggio)").replace(/\n/g, "<br>")}</p>` +
        (chi === "privato"
          ? `<p>Ha ricevuto la lettera con il tasto per attivare Movijoy da solo: non serve scrivergli.</p>`
          : `<p>Ha ricevuto una conferma: aspetta che una persona lo contatti.</p>`) +
        `<p style="color:#6b7280">origine: ${sfuggi(origine ?? "—")}</p>`,
    ),
  };
}

/** La password nuova, a chi l'ha dimenticata. */
export function letteraNuovaPassword({ email, password }: { email: string; password: string }) {
  return {
    oggetto: "La tua nuova password per Movijoy",
    html: guscio(
      `<p>Ecco una password nuova per entrare in Movijoy. Quella di prima non vale più.</p>` +
        credenziali(email, password) +
        `<p>Al primo accesso ti chiedo di sceglierne una tua.</p>` +
        tasto(`${SITO}/entra`, "Entra") +
        `<p style="font-size:13px;color:#6b7280">Se non l'hai chiesta tu, qualcuno ha scritto il tuo indirizzo nel modulo: entra e cambia subito la password, e scrivici a principale@chelivello.it.</p>`,
    ),
  };
}
