import { resolveMx, resolve4, resolve6 } from "node:dns/promises";

/**
 * La verifica di un'email e di un numero di telefono, quando li si
 * inserisce.
 *
 * EMAIL: forma giusta, e il dominio deve esistere e ricevere posta
 * (record MX; in mancanza, almeno un indirizzo A/AAAA). Prende gli
 * errori di battitura («gmial.com») e gli indirizzi inventati. Se il
 * DNS non risponde entro due secondi si lascia passare: un guasto di
 * rete nostro non deve bloccare una persona vera.
 *
 * TELEFONO: si normalizza in forma internazionale (+39 se manca il
 * prefisso e sembra italiano) e deve essere un numero plausibile
 * (E.164: da 8 a 15 cifre). ⚠️ NON È UNA VERIFICA CHE IL NUMERO SIA
 * SUO: per quella serve un codice via SMS, cioè un fornitore (Twilio o
 * simili) che oggi non c'è. Qui si garantisce che sia un numero vero
 * nella forma, non che risponda.
 */

const FORMA_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function conTempo<T>(p: Promise<T>, ms: number): Promise<T | "tempo"> {
  return Promise.race([p, new Promise<"tempo">((r) => setTimeout(() => r("tempo"), ms))]);
}

export async function emailValida(email: string): Promise<boolean> {
  const e = email.trim().toLowerCase();
  if (!FORMA_EMAIL.test(e) || e.length > 200) return false;
  const dominio = e.slice(e.lastIndexOf("@") + 1);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(dominio) || dominio.includes("..")) return false;
  try {
    const mx = await conTempo(resolveMx(dominio), 2000);
    if (mx === "tempo") return true;
    if (mx.length > 0) return true;
  } catch {
    /* nessun MX: si prova con A/AAAA */
  }
  try {
    const a = await conTempo(Promise.any([resolve4(dominio), resolve6(dominio)]), 2000);
    return a === "tempo" ? true : a.length > 0;
  } catch {
    return false;
  }
}

/** Il numero in forma internazionale, o null se non è un numero plausibile. */
export function telefonoNormale(grezzo: string): string | null {
  let t = grezzo.trim().replace(/[\s().\-]/g, "");
  if (!t) return null;
  if (t.startsWith("00")) t = "+" + t.slice(2);
  if (!t.startsWith("+")) {
    /* Italiano senza prefisso: cellulare (3…) o fisso (0…). */
    if (/^3\d{8,9}$/.test(t) || /^0\d{5,10}$/.test(t)) t = "+39" + t;
    else return null;
  }
  return /^\+[1-9]\d{7,14}$/.test(t) ? t : null;
}
