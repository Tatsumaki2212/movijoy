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
  /* Google Search Console: il codice di verifica arriva da una variabile
     (GOOGLE_SITE_VERIFICATION); finché non c'è, il tag non compare. */
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  openGraph: { type: "website", locale: "it_IT", siteName: NOME_SITO },
};

/* Chi siamo e che cos'è questo sito, in una forma che una macchina
   legge senza interpretare il testo: vale per Google e vale ancora di
   più per chi riassume pagine con un modello. */
const DATI_SITO = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITO}/#societa`,
      name: "«Che Livello!» S.r.l.",
      url: "https://www.chelivello.it",
      brand: { "@type": "Brand", name: "Movijoy" },
    },
    {
      "@type": "WebSite",
      "@id": `${SITO}/#sito`,
      url: SITO,
      name: NOME_SITO,
      inLanguage: "it",
      publisher: { "@id": `${SITO}/#societa` },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  /* ⚠️ data-js STA NELL'HTML CHE ARRIVA DAL SERVER, e il <noscript>
     qui sotto lo annulla per chi non ha JavaScript. Il primo schermo
     mette la frase a specchio sul piano solo sotto html[data-js]: con
     lo script, poi si raddrizza; senza script, lo stile dentro
     <noscript> la rimette dritta prima ancora del primo disegno.
     La prima versione aggiungeva l'attributo con uno script in testa e
     React, all'idratazione, segnalava un attributo che il server non
     aveva reso: così invece server e client combaciano. */
  return (
    <html lang="it" data-js="" className={`${archivo.variable} ${archivoNarrow.variable}`}>
      <head>
        <noscript>
          <style>{`.mj-casa[data-fase="fermo"] .mj-correzione__frasi{transform:none !important;opacity:1 !important;filter:none !important}.mj-casa[data-fase="fermo"] .mj-correzione__perche{opacity:1 !important}`}</style>
        </noscript>
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(DATI_SITO) }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
