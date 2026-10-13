import type { MetadataRoute } from "next";
import { SITO } from "./lib/sito";

/**
 * Cosa possono guardare i motori: tutto. Su questo dominio non c'è un
 * registro, non c'è un accesso, non c'è niente di privato — il
 * prodotto gira su chelivello.it, e il giorno in cui qualcosa di
 * riservato nascerà qui, nascerà insieme alla riga che lo chiude.
 *
 * I crawler delle IA NON sono bloccati, ed è una scelta: un dominio
 * nuovo non ha collegamenti in entrata né storia, e le risposte di
 * ChatGPT e Perplexity sono uno dei pochi modi in cui può farsi
 * trovare il primo mese.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITO}/sitemap.xml`,
    host: SITO,
  };
}
