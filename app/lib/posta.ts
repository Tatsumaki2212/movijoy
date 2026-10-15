import { SITO, NOME_SITO } from "./sito";

/**
 * La posta di Movijoy privato: due lettere, da Resend.
 *
 * ⚠️ IL MITTENTE È UN INDIRIZZO VERIFICATO SU RESEND (MITTENTE_EMAIL,
 * oggi un indirizzo @chelivello.it): finché il dominio movijoy.it non
 * è verificato lì, una lettera «da movijoy.it» non parte. Il nome
 * mostrato resta Movijoy.
 *
 * `manda` non solleva mai: torna false, e chi chiama decide. Ma qui le
 * lettere portano il link per entrare: chi chiama DEVE guardare
 * l'esito, altrimenti la persona ha pagato e non entra.
 */

export const postaConfigurata = Boolean(process.env.RESEND_API_KEY && process.env.MITTENTE_EMAIL);

export async function manda({ a, oggetto, html }: { a: string; oggetto: string; html: string }): Promise<boolean> {
  const chiave = process.env.RESEND_API_KEY;
  const mittente = process.env.MITTENTE_EMAIL;
  if (!chiave || !mittente) return false;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${chiave}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: `${NOME_SITO} <${mittente.replace(/^.*<|>.*$/g, "")}>`, to: [a], subject: oggetto, html }),
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
<p style="margin:28px 0 0;font-size:12px;color:#6b7280">Che Livello! S.r.l. · Genova · <a href="${SITO}" style="color:#6b7280">${SITO.replace(/^https?:\/\//, "")}</a></p>
</div></body></html>`;
}

function tasto(link: string, testo: string): string {
  return `<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#c8102e;color:#fff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:4px">${testo}</a></p>
<p style="font-size:13px;color:#6b7280">Se il tasto non funziona: <a href="${link}" style="color:#16233a;word-break:break-all">${link}</a></p>`;
}

export function letteraBenvenuto({ link, nome }: { link: string; nome?: string | null }) {
  return {
    oggetto: "Il tuo Movijoy è attivo: entra",
    html: guscio(
      `<p>${nome ? `${sfuggi(nome)}, il` : "Il"} tuo Movijoy è attivo. Il tasto qui sotto ti fa entrare: cinque domande per dirgli come scrivi, poi è tuo.</p>` +
        tasto(link, "Entra nel tuo Movijoy") +
        `<p style="font-size:13px;color:#6b7280">Il link vale un'ora e una volta sola. Scaduto, da ${SITO}/entra te ne mandiamo un altro con la stessa email.</p>`,
    ),
  };
}

export function letteraIngresso({ link }: { link: string }) {
  return {
    oggetto: "Il tuo link per entrare in Movijoy",
    html: guscio(
      `<p>Questo è il link per entrare nel tuo Movijoy. Vale un'ora e una volta sola: aprilo dallo stesso telefono o computer da cui vuoi usarlo.</p>` +
        tasto(link, "Entra") +
        `<p style="font-size:13px;color:#6b7280">Se non l'hai chiesto tu, ignora questa mail: senza aprire il link non succede niente.</p>`,
    ),
  };
}
