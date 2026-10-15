import { NextResponse } from "next/server";
import { clientePerEmail } from "@/app/lib/clienti";
import { linkIngresso } from "@/app/lib/accesso";
import { letteraIngresso, manda } from "@/app/lib/posta";
import { SITO } from "@/app/lib/sito";
import { emailValida } from "@/app/lib/verifica";

/**
 * «Mandami il link»: il modulo di /entra.
 *
 * ⚠️ RISPONDE SEMPRE ALLO STESSO MODO, esista o no l'indirizzo. Una
 * pagina che dice «non risulta nessun cliente» è un modo per scoprire
 * chi è cliente, un indirizzo per volta. La lettera parte solo a chi
 * ha un Movijoy; gli altri vedono la stessa frase.
 */
export async function POST(req: Request) {
  let email = "";
  try {
    const modulo = await req.formData();
    email = String(modulo.get("email") ?? "").trim().toLowerCase();
  } catch {}
  if (!(await emailValida(email))) {
    return NextResponse.redirect(`${SITO}/entra?errore=email`, 303);
  }

  const cliente = await clientePerEmail(email);
  if (cliente && cliente.stato !== "chiuso") {
    const link = await linkIngresso(email);
    if (link) {
      const L = letteraIngresso({ link });
      await manda({ a: email, oggetto: L.oggetto, html: L.html });
    }
  }
  return NextResponse.redirect(`${SITO}/entra?mandato=1`, 303);
}
