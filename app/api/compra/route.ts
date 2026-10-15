import { NextResponse } from "next/server";
import { stripe, stripeConfigurato, PREZZI } from "@/app/lib/stripe";
import { SITO } from "@/app/lib/sito";

/**
 * «Attiva il tuo Movijoy»: il modulo di /privato manda qui, e da qui si
 * va alla cassa di Stripe con la configurazione una tantum e la
 * manutenzione mensile nella stessa sessione.
 *
 * Niente JavaScript in mezzo: è un modulo con method="post" e la
 * risposta è un redirect 303 alla pagina di Stripe. Funziona anche con
 * gli script spenti, e non c'è nessuno stato da tenere qui.
 *
 * ⚠️ IL CONSENSO ALL'AVVIO IMMEDIATO È OBBLIGATORIO. Per un consumatore
 * vale il recesso di quattordici giorni sui contratti a distanza: la
 * configurazione è un servizio che parte subito, e senza il suo
 * consenso esplicito potrebbe chiedere indietro i 199,99 anche dopo
 * averla avuta. La casella va spuntata, e la risposta resta scritta
 * nei metadati della sessione di Stripe, con l'ora.
 */
export async function POST(req: Request) {
  const s = stripe();
  if (!s || !stripeConfigurato()) {
    return NextResponse.json({ errore: "La cassa non è ancora collegata. Scrivi a principale@chelivello.it." }, { status: 503 });
  }

  let email: string | undefined;
  let consenso = false;
  try {
    const modulo = await req.formData();
    const e = String(modulo.get("email") ?? "").trim().toLowerCase();
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) email = e;
    consenso = modulo.get("consenso") === "si";
  } catch {
    /* senza modulo: Stripe chiede l'email da sé */
  }
  if (!consenso) return NextResponse.redirect(`${SITO}/privato?errore=consenso`, 303);

  try {
    const sessione = await s.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: PREZZI.mensile, quantity: 1 },
        { price: PREZZI.configurazione, quantity: 1 },
      ],
      customer_email: email,
      locale: "it",
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      allow_promotion_codes: true,
      success_url: `${SITO}/attivato`,
      cancel_url: `${SITO}/privato`,
      metadata: { sito: "movijoy", linea: "privato", consenso_avvio_immediato: new Date().toISOString() },
      subscription_data: { metadata: { sito: "movijoy", linea: "privato" } },
    });
    if (!sessione.url) throw new Error("Stripe non ha dato un indirizzo");
    return NextResponse.redirect(sessione.url, 303);
  } catch (e) {
    console.error("compra:", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${SITO}/privato?errore=cassa`, 303);
  }
}
