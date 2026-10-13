"use client";

import { useEffect, useState } from "react";
import Sfera from "./Sfera";
import Richiesta from "./Richiesta";

/**
 * Il primo schermo: un oggetto solo.
 *
 * La sfera sopra il piano nero lucido che la riflette; a sinistra il
 * titolo, sotto la correzione di una frase vera; a destra, sul piano,
 * la targa con l'email. Il contratto di direzione sta in
 * .impeccable/surfaces/app-page-tsx.md, non qui.
 *
 * ⚠️ UN MOMENTO SOLO, ORCHESTRATO. La frase sbagliata compare prima a
 * specchio nel riflesso, poi si raddrizza; mentre il perché viene
 * «detto», la bocca della sfera si muove e il piano si increspa — è
 * la stessa variabile `parla` che va allo shader. Tutto il testo è nel
 * DOM da subito: l'animazione aggiunge classi, non contenuto. Con
 * `prefers-reduced-motion` non parte niente e la frase è dritta.
 *
 * ⚠️ L'ESEMPIO È VERO: sbagliato, giusto e perché vengono dal modulo
 * future-perfect di chelivello (app/lib/grammatica/), copiati
 * testualmente. Non è inventato per fare bella figura.
 */

const ESEMPIO = {
  male: "Within Friday I will finish the report.",
  bene: { prima: "", parola: "By", dopo: " Friday I'll have finished the report." },
  nasce: "nasce da «entro venerdì»",
  perche:
    "«Entro venerdì» si dice by Friday, non «within Friday». Within vuol dire «nel giro di»: within three days = entro tre giorni da adesso.",
};

/* I tempi, in millisecondi: quanto la frase resta a specchio sul piano,
   quando si raddrizza, quando parte il parlato. La durata del parlato
   segue la lunghezza del perché a ~55 ms per carattere, il ritmo di
   una lettura ad alta voce. */
const T_RADDRIZZA = 1400;
const T_PARLA = 2600;
const MS_PER_CARATTERE = 55;

export default function PrimoSchermo() {
  /* ⚠️ LA FRASE È UNA SOLA, E SI RADDRIZZA PER DAVVERO. Nello stato
     «fermo» il CSS la mette a specchio sul piano — ma solo quando c'è
     JavaScript (html[data-js], scritto dal layout prima di tutto) e
     non è chiesto meno movimento: così chi non ha script o non vuole
     movimento la vede dritta da subito, e nessuno la vede saltare.
     A «raddrizza» la stessa frase sale e si gira fino al suo posto
     sotto il titolo: è il momento che il contratto promette, non una
     dissolvenza di una copia. Sul server lo stato è «fermo» e il
     perché è tutto scritto: l'HTML che arriva è completo. */
  const [fase, setFase] = useState<"fermo" | "raddrizza" | "parla" | "finito">("fermo");
  const [parla, setParla] = useState(false);
  const [detti, setDetti] = useState(ESEMPIO.perche.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tempi: number[] = [];
    const dopo = (ms: number, f: () => void) => tempi.push(window.setTimeout(f, ms));

    dopo(T_RADDRIZZA, () => setFase("raddrizza"));
    dopo(T_PARLA, () => {
      setFase("parla");
      setParla(true);
      setDetti(0);
      /* Il perché compare lettera per lettera mentre la bocca si muove.
         Un solo intervallo, cancellato alla fine o allo smontaggio. */
      let n = 0;
      const giro = window.setInterval(() => {
        n += 1;
        setDetti(n);
        if (n >= ESEMPIO.perche.length) {
          window.clearInterval(giro);
          setParla(false);
          setFase("finito");
        }
      }, MS_PER_CARATTERE);
      tempi.push(giro);
    });

    return () => {
      tempi.forEach((t) => {
        window.clearTimeout(t);
        window.clearInterval(t);
      });
    };
  }, []);

  return (
    <section className="mj-foglio mj-casa" data-fase={fase}>
      <Sfera classe="mj-tela mj-tela--casa" parla={parla} />

      <div className="mj-casa__testo">
        <h1 className="mj-titolo">
          Scrivi.
          <br />
          Ti dico dove
          <br />
          <em>perdi il punto.</em>
        </h1>

        <div className="mj-correzione" aria-live="off">
          <div className="mj-correzione__frasi">
            <p className="mj-correzione__male">{ESEMPIO.male}</p>
            <p className="mj-correzione__bene">
              {ESEMPIO.bene.prima}
              <mark className="mj-correzione__parola">{ESEMPIO.bene.parola}</mark>
              {ESEMPIO.bene.dopo}
            </p>
          </div>
          <div className="mj-correzione__perche">
            <span className="mj-cartellino">{ESEMPIO.nasce}</span>
            <p>
              {/* Tutto il testo è nel DOM: la parte non ancora «detta» è
                  solo in tono minore, così chi legge con lo schermo la
                  riceve intera, la pagina non cambia misura, e niente
                  è nascosto dietro un'animazione. */}
              <span>{ESEMPIO.perche.slice(0, detti)}</span>
              <span className="mj-correzione__nondetto" aria-hidden="true">
                {ESEMPIO.perche.slice(detti)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="mj-casa__targa">
        <div className="mj-targa">
          <h2 className="mj-targa__titolo">
            Il tuo Movijoy: con i tuoi criteri, sulla tua piattaforma o solo per te.
          </h2>
          <Richiesta variante="targa" />
        </div>
      </div>
    </section>
  );
}
