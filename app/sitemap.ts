import type { MetadataRoute } from "next";
import { SITO } from "./lib/sito";

/**
 * La mappa di movijoy.it.
 *
 * ⚠️ UNA VOCE SOLA, OGGI. Il sito ha una pagina: metterne in mappa di
 * più — prezzi, come funziona — prima che esistano vuol dire
 * consegnare al crawler una lista di 404. Le pagine si aggiungono QUI
 * nello stesso momento in cui nascono sotto app/.
 *
 * La radice si scrive senza la barra finale, com'è nel canonical che
 * Next genera: mappa e canonical devono dire lo stesso indirizzo.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  /* /parla e /grazie non entrano in mappa: sono tappe di un percorso,
     noindex, non pagine da cercare. */
  return [
    { url: SITO, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${SITO}/all-opera`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ];
}
