import { NextResponse } from "next/server";
import { clientePerEmail, segnaPassword } from "@/app/lib/clienti";
import { assegnaPasswordTemporanea } from "@/app/lib/accesso";
import { letteraNuovaPassword, manda } from "@/app/lib/posta";
import { emailValida } from "@/app/lib/verifica";
import { SITO } from "@/app/lib/sito";

/**
 * «Password dimenticata»: una password temporanea nuova, per email.
 *
 * ⚠️ RISPONDE SEMPRE ALLO STESSO MODO, esista o no l'indirizzo: un
 * modulo che dice «non risulta nessun cliente» è un modo per scoprire
 * chi è cliente. La lettera parte solo a chi ha un Movijoy.
 *
 * ⚠️ CAMBIA LA PASSWORD DELL'ACCOUNT, che per chi ha anche Che Livello!
 * è lo stesso: la lettera lo dice. È il prezzo di avere un account
 * solo per i due siti, ed è il comportamento che una persona si aspetta
 * da «password dimenticata».
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const modulo = await req.formData();
    email = String(modulo.get("email") ?? "").trim().toLowerCase();
  } catch {}
  if (!(await emailValida(email))) return NextResponse.redirect(`${SITO}/entra?errore=email`, 303);

  const cliente = await clientePerEmail(email);
  if (cliente && cliente.utente && cliente.stato !== "chiuso") {
    const password = await assegnaPasswordTemporanea(cliente.utente);
    if (password) {
      await segnaPassword(cliente.id, true);
      const L = letteraNuovaPassword({ email, password });
      const partita = await manda({ a: email, oggetto: L.oggetto, html: L.html });
      if (!partita) console.error("password dimenticata: lettera non partita per", email);
    }
  }
  return NextResponse.redirect(`${SITO}/entra?mandata=1`, 303);
}
