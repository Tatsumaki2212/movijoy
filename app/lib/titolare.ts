/**
 * Il contatto del sito. Dal 16 ottobre 2026 vende e incassa la società
 * (lib/societa.ts): la riga «incassi e ricevute: Lorenzo…» del
 * passaggio è stata tolta dal piede quel giorno. Resta l'indirizzo di
 * posta, che è lo stesso.
 */
export const TITOLARE = {
  nome: "Lorenzo Antonio Moccia",
  partitaIva: "03093230997",
  /* La casella a cui per legge si esercitano i diritti sui dati: la
     stessa di chelivello, perché l'informativa è una sola. */
  email: "principale@chelivello.it",
} as const;
