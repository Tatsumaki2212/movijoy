import { NextResponse } from "next/server";
import { utenteCorrente } from "@/app/lib/db";
import { cambiaPassword } from "@/app/lib/accesso";
import { clientePerUtente, segnaPassword } from "@/app/lib/clienti";
import { SITO } from "@/app/lib/sito";

/**
 * Il cambio della password (/io/password): obbligatorio dopo una
 * temporanea, possibile quando si vuole.
 *
 * Dieci caratteri almeno, e non uguale all'email: la regola è corta
 * perché una regola lunga produce password scritte su un foglietto.
 */
export async function POST(req: Request) {
  const utente = await utenteCorrente();
  if (!utente) return NextResponse.redirect(`${SITO}/entra`, 303);

  let nuova = "";
  let ripeti = "";
  try {
    const m = await req.formData();
    nuova = String(m.get("nuova") ?? "");
    ripeti = String(m.get("ripeti") ?? "");
  } catch {}

  if (nuova.length < 10 || nuova.length > 200) return NextResponse.redirect(`${SITO}/io/password?errore=corta`, 303);
  if (nuova.trim().toLowerCase() === utente.email.toLowerCase()) {
    return NextResponse.redirect(`${SITO}/io/password?errore=email`, 303);
  }
  if (nuova !== ripeti) return NextResponse.redirect(`${SITO}/io/password?errore=diverse`, 303);

  const ok = await cambiaPassword(nuova);
  if (!ok) return NextResponse.redirect(`${SITO}/io/password?errore=salvataggio`, 303);

  const cliente = await clientePerUtente(utente.id);
  if (cliente) await segnaPassword(cliente.id, false);
  return NextResponse.redirect(`${SITO}/io?password=cambiata`, 303);
}
