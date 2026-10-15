import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";
import { servizio } from "@/app/lib/db";
import { attivaCliente, cambiaStato, clientePerAbbonamento, type StatoCliente } from "@/app/lib/clienti";
import { linkIngresso } from "@/app/lib/accesso";
import { letteraBenvenuto, manda } from "@/app/lib/posta";

/**
 * Il webhook di Stripe per Movijoy privato (endpoint registrato il 15
 * ottobre 2026 su https://www.movijoy.it/api/stripe).
 *
 *  - checkout.session.completed → il cliente nasce (o si riattiva),
 *    riceve la lettera di benvenuto con il link per entrare.
 *  - customer.subscription.updated / deleted, invoice.paid,
 *    invoice.payment_failed → lo stato del cliente segue Stripe.
 *
 * ⚠️ LA FIRMA SUL CORPO GREZZO, prima di tutto. E ogni evento si segna
 * in mj_eventi_stripe: Stripe ritenta, e un evento ripetuto non deve
 * mandare due lettere.
 */

function statoDa(status: Stripe.Subscription.Status): StatoCliente {
  switch (status) {
    case "active":
    case "trialing":
      return "attivo";
    case "past_due":
    case "unpaid":
    case "incomplete":
      return "sospeso";
    default:
      return "chiuso";
  }
}

export async function POST(req: Request) {
  const s = stripe();
  const segreto = process.env.STRIPE_WEBHOOK_SECRET;
  if (!s || !segreto) return NextResponse.json({ errore: "webhook non configurato" }, { status: 503 });

  const firma = req.headers.get("stripe-signature") ?? "";
  const grezzo = await req.text();
  let evento: Stripe.Event;
  try {
    evento = s.webhooks.constructEvent(grezzo, firma, segreto);
  } catch (e) {
    console.error("stripe: firma —", e instanceof Error ? e.message : e);
    return NextResponse.json({ errore: "firma non valida" }, { status: 400 });
  }

  const sb = servizio();
  if (!sb) return NextResponse.json({ errore: "database non collegato" }, { status: 503 });
  const { error: eVisto } = await sb.from("mj_eventi_stripe").insert({ id: evento.id, tipo: evento.type });
  if (eVisto) {
    /* 23505 = già visto: ok senza rifare niente. */
    if (eVisto.code === "23505") return NextResponse.json({ ok: true, duplicato: true });
    console.error("stripe: eventi —", eVisto.message);
  }

  try {
    switch (evento.type) {
      case "checkout.session.completed": {
        const sess = evento.data.object;
        if (sess.metadata?.sito !== "movijoy") break;
        const email = sess.customer_details?.email ?? sess.customer_email;
        if (!email) {
          console.error("stripe: sessione senza email", sess.id);
          break;
        }
        const cliente = await attivaCliente({
          email,
          nome: sess.customer_details?.name ?? null,
          stripeCliente: typeof sess.customer === "string" ? sess.customer : (sess.customer?.id ?? null),
          stripeAbbonamento:
            typeof sess.subscription === "string" ? sess.subscription : (sess.subscription?.id ?? null),
        });
        if (!cliente) throw new Error("cliente non creato");
        const link = await linkIngresso(email);
        if (!link) throw new Error("link d'ingresso non generato");
        const L = letteraBenvenuto({ link, nome: cliente.nome });
        const partita = await manda({ a: email, oggetto: L.oggetto, html: L.html });
        if (!partita) console.error("stripe: la lettera di benvenuto non è partita per", email);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const abb = evento.data.object;
        const cliente = await clientePerAbbonamento(abb.id);
        if (cliente) await cambiaStato(cliente.id, evento.type.endsWith("deleted") ? "chiuso" : statoDa(abb.status));
        break;
      }
      case "invoice.paid":
      case "invoice.payment_failed": {
        const fattura = evento.data.object;
        const dettagli = fattura.parent?.subscription_details;
        const idAbb = dettagli?.subscription;
        const id = typeof idAbb === "string" ? idAbb : (idAbb?.id ?? null);
        if (!id) break;
        const cliente = await clientePerAbbonamento(id);
        if (cliente) await cambiaStato(cliente.id, evento.type === "invoice.paid" ? "attivo" : "sospeso");
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("stripe:", evento.type, e instanceof Error ? e.message : e);
    /* Si risponde 500 di proposito: Stripe ritenta, e l'evento è stato
       segnato — al tentativo dopo si risponde ok senza rifare. Per non
       perdere la lettera, la riga segnata si toglie. */
    await sb.from("mj_eventi_stripe").delete().eq("id", evento.id);
    return NextResponse.json({ errore: "non lavorato" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
