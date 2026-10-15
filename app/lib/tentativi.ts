import { createHash } from "node:crypto";
import { servizio } from "./db";

/**
 * Il freno sui tentativi di accesso (SQL 52, tabella mj_tentativi).
 *
 * Il login passa dalla chiave di servizio, senza captcha: senza un
 * freno, questa rotta sarebbe un posto dove provare password a
 * raffica. Otto tentativi in un quarto d'ora per impronta — indirizzo
 * IP più email, ridotti a un hash: non si tengono IP in chiaro — poi
 * si risponde «troppi tentativi» senza nemmeno provare.
 *
 * Se il database non risponde si lascia passare: un guasto nostro non
 * deve chiudere fuori i clienti, e il rischio di un quarto d'ora senza
 * freno è piccolo.
 */

const FINESTRA_MINUTI = 15;
const MASSIMO = 8;

export function improntaDi(req: Request, email: string): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "sconosciuto";
  return createHash("sha256").update(`${ip}|${email.trim().toLowerCase()}`).digest("hex");
}

export async function cEMargine(impronta: string): Promise<boolean> {
  const sb = servizio();
  if (!sb) return true;
  const da = new Date(Date.now() - FINESTRA_MINUTI * 60_000).toISOString();
  const { count, error } = await sb
    .from("mj_tentativi")
    .select("id", { count: "exact", head: true })
    .eq("impronta", impronta)
    .gte("quando", da);
  if (error) {
    console.error("tentativi:", error.message);
    return true;
  }
  return (count ?? 0) < MASSIMO;
}

export async function segnaTentativo(impronta: string, esito: "ok" | "no"): Promise<void> {
  const sb = servizio();
  if (!sb) return;
  const { error } = await sb.from("mj_tentativi").insert({ impronta, esito });
  if (error) console.error("tentativi:", error.message);
}
