import Anthropic from "@anthropic-ai/sdk";

/**
 * Il client del modello per Movijoy privato.
 *
 * Il registro di chelivello usa il modello grande per le correzioni
 * d'esame; qui si correggono email e documenti di lavoro, e la promessa
 * è «venti secondi»: il modello medio della stessa famiglia basta, e
 * costa meno a ogni chiamata. Per la configurazione iniziale (la mappa
 * degli errori da dieci testi, una volta sola) si usa quello grande.
 */

export const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const MODELLO_CORREZIONE = "claude-sonnet-5-5";
export const MODELLO_CONFIGURAZIONE = "claude-opus-5-5";

export function chiaveMancante(): boolean {
  return !process.env.ANTHROPIC_API_KEY;
}

/** Il primo blocco di testo della risposta, o stringa vuota. */
export function primoTesto(contenuto: Anthropic.ContentBlock[]): string {
  for (const b of contenuto) {
    if (b.type === "text") return b.text;
  }
  return "";
}
