import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITO, NOME_SITO } from "./lib/sito";

/**
 * La radice di movijoy.it. Sua, non condivisa.
 *
 * Questo sito è nato il 13 ottobre 2026 come progetto a parte proprio
 * per avere una radice sua: finché Movijoy stava dentro il repository
 * di chelivello, il layout di radice del portale — con il suo piè di
 * pagina, i suoi collegamenti e i suoi strumenti — compariva in fondo
 * a ogni pagina di movijoy.it. Qui non c'è niente che non sia di
 * Movijoy.
 *
 * ⚠️ NESSUN PIXEL E NESSUN BANNER, DI PROPOSITO. L'unico strumento di
 * misura è il contatore di Vercel, che non usa cookie e non assegna
 * identificativi: per legge non richiede consenso, quindi non c'è un
 * banner da mostrare. Il giorno in cui su questo dominio arriverà un
 * pixel pubblicitario, il consenso va chiesto PRIMA di caricarlo —
 * non dopo, come fa il pixel di Meta nell'<head> di chelivello. Il
 * consenso dato là non vale qui: è per dominio.
 *
 * I caratteri sono gli stessi di chelivello (Archivo e Archivo Narrow,
 * solo latino), caricati da file locali: nessuna richiesta a Google
 * Fonts, nessun indirizzo IP che parte verso terzi per un carattere.
 */

const archivo = localFont({
  src: "./caratteri/archivo-latin.woff2",
  variable: "--f-stampa",
  display: "swap",
});

const archivoNarrow = localFont({
  src: "./caratteri/narrow-latin.woff2",
  variable: "--f-colonna",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITO),
  title: {
    default: NOME_SITO,
    template: `%s — ${NOME_SITO}`,
  },
  description:
    "Movijoy è un'intelligenza artificiale che corregge l'inglese scritto sui criteri ufficiali Cambridge e IELTS, in venti secondi, con il motivo accanto a ogni riga.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${archivo.variable} ${archivoNarrow.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
