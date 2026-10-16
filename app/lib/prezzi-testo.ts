/**
 * I prezzi di Movijoy privato, come si scrivono in pagina.
 *
 * Stanno in un modulo senza dipendenze perché li leggono anche il dialogo
 * e la pagina del grazie, che girano nel browser: lib/stripe.ts, che li
 * ri-esporta, importa la libreria di Stripe e non può entrare in un
 * pacchetto per il browser. I prezzi su Stripe sono netti; l'IVA al 22%
 * si aggiunge alla cassa (decisione di Lorenzo, 16 ottobre 2026).
 */
export const CONFIGURAZIONE_TESTO = "199,99 €";
export const MENSILE_TESTO = "49,99 €";
export const PIU_IVA = "+ IVA 22%";
