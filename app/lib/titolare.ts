/**
 * Chi incassa, finché non incassa la società.
 *
 * ⚠️ COPIA RIDOTTA di app/lib/titolare.ts di chelivello, con i soli
 * campi che questo sito stampa. La regola è la stessa di là: dal 7
 * ottobre 2026 la società ha la partita IVA, ma Stripe è ancora
 * intestato alla partita IVA individuale di Lorenzo in regime
 * forfettario, e le ricevute escono da lei. La legge chiede che su un
 * sito che vende sia scritto chi vende DAVVERO, non chi venderà —
 * quindi finché Stripe non passa alla società, in fondo alle pagine si
 * dice chi incassa. Il giorno del passaggio si toglie questa riga di
 * là e di qua, insieme.
 */
export const TITOLARE = {
  nome: "Lorenzo Antonio Moccia",
  partitaIva: "03093230997",
  /* La casella a cui per legge si esercitano i diritti sui dati: la
     stessa di chelivello, perché l'informativa è una sola. */
  email: "principale@chelivello.it",
} as const;
