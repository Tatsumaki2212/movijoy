import { NextResponse } from "next/server";
import { entraConPassword } from "@/app/lib/accesso";
import { clientePerUtente } from "@/app/lib/clienti";
import { SITO } from "@/app/lib/sito";
import { cEMargine, improntaDi, segnaTentativo } from "@/app/lib/tentativi";

/**
 * «Entra»: email e password. Il nome utente è l'email.
 *
 * Password sbagliata o indirizzo sconosciuto danno la stessa frase: una
 * pagina che distingue i due casi dice a chi prova indirizzi a caso
 * quali sono clienti. Chi entra con una password temporanea va a
 * sceglierne una sua prima di tutto il resto.
 */
export async function POST(req: Request) {
  let email = "";
  let password = "";
  try {
    const modulo = await req.formData();
    email = String(modulo.get("email") ?? "").trim().toLowerCase();
    password = String(modulo.get("password") ?? "");
  } catch {}
  if (!email || !password) return NextResponse.redirect(`${SITO}/entra?errore=password`, 303);

  /* Il freno: otto tentativi in un quarto d'ora per IP+email, poi stop. */
  const impronta = improntaDi(req, email);
  if (!(await cEMargine(impronta))) return NextResponse.redirect(`${SITO}/entra?errore=troppi`, 303);

  const utente = await entraConPassword(email, password);
  await segnaTentativo(impronta, utente ? "ok" : "no");
  if (!utente) return NextResponse.redirect(`${SITO}/entra?errore=password`, 303);

  const cliente = await clientePerUtente(utente);
  if (cliente?.password_da_cambiare) return NextResponse.redirect(`${SITO}/io/password`, 303);
  return NextResponse.redirect(`${SITO}/io`, 303);
}
