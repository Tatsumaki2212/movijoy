import Stripe from "stripe";

/**
 * Stripe per Movijoy privato: lo stesso account della società
 * («CheLivello!»), con due prezzi creati il 15 ottobre 2026 —
 * la configurazione una tantum e la manutenzione mensile — e un
 * webhook che punta a /api/stripe.
 */

export function stripe(): Stripe | null {
  const chiave = process.env.STRIPE_SECRET_KEY;
  return chiave ? new Stripe(chiave) : null;
}

export const PREZZI = {
  configurazione: process.env.STRIPE_PRICE_MJ_CONFIGURAZIONE ?? "",
  mensile: process.env.STRIPE_PRICE_MJ_MENSILE ?? "",
};

export function stripeConfigurato(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && PREZZI.configurazione && PREZZI.mensile);
}

/* I prezzi su Stripe sono netti; l'IVA al 22% si aggiunge con l'aliquota
   STRIPE_TAX_RATE_IVA nella sessione. In pagina si mostra il netto con
   «+ IVA 22%» accanto; il totale lo si vede alla cassa. */
export const CONFIGURAZIONE_TESTO = "199,99 €";
export const MENSILE_TESTO = "49,99 €";
export const PIU_IVA = "+ IVA 22%";
export const ALIQUOTA_IVA = process.env.STRIPE_TAX_RATE_IVA ?? null;
export function aliquote(): string[] | undefined {
  return ALIQUOTA_IVA ? [ALIQUOTA_IVA] : undefined;
}
