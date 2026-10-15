import { NextResponse } from "next/server";
import { sessione } from "@/app/lib/db";
import { SITO } from "@/app/lib/sito";

/**
 * Dove atterra chi clicca il link ricevuto per email (lib/accesso.ts).
 *
 * Il gettone si scambia qui con una sessione vera, scritta nei cookie
 * dalla rotta: da questo momento /io sa chi è. Un gettone usato o
 * scaduto rimanda a /entra con il motivo, senza errore rosso.
 */
export async function GET(req: Request) {
  const gettone = new URL(req.url).searchParams.get("gettone");
  if (!gettone) return NextResponse.redirect(`${SITO}/entra`, 303);

  const sb = await sessione();
  if (!sb) return NextResponse.redirect(`${SITO}/entra?errore=link`, 303);

  const { error } = await sb.auth.verifyOtp({ token_hash: gettone, type: "magiclink" });
  if (error) {
    console.warn("conferma:", error.message);
    return NextResponse.redirect(`${SITO}/entra?errore=scaduto`, 303);
  }
  return NextResponse.redirect(`${SITO}/io`, 303);
}
