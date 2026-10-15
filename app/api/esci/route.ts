import { NextResponse } from "next/server";
import { sessione } from "@/app/lib/db";
import { SITO } from "@/app/lib/sito";

/** Esce con una POST: un'uscita raggiungibile con un semplice indirizzo
    può essere fatta scattare da fuori. */
export async function POST() {
  const sb = await sessione();
  if (sb) await sb.auth.signOut();
  return NextResponse.redirect(`${SITO}/`, 303);
}
