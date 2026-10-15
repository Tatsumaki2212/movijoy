import { NextResponse } from "next/server";
import { utenteCorrente } from "@/app/lib/db";
import { clientePerUtente } from "@/app/lib/clienti";
import { stripe } from "@/app/lib/stripe";
import { SITO } from "@/app/lib/sito";

/** «Il conto»: carta, fatture, disdetta — sul portale di Stripe. */
export async function POST() {
  const utente = await utenteCorrente();
  if (!utente) return NextResponse.redirect(`${SITO}/entra`, 303);
  const cliente = await clientePerUtente(utente.id);
  const s = stripe();
  if (!cliente?.stripe_cliente || !s) return NextResponse.redirect(`${SITO}/io?errore=conto`, 303);
  try {
    const portale = await s.billingPortal.sessions.create({
      customer: cliente.stripe_cliente,
      return_url: `${SITO}/io`,
    });
    return NextResponse.redirect(portale.url, 303);
  } catch (e) {
    console.error("portale:", e instanceof Error ? e.message : e);
    return NextResponse.redirect(`${SITO}/io?errore=conto`, 303);
  }
}
