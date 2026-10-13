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

/* I tempi, in millisecondi: lo specchio, il raddrizzarsi, il parlato.
   La durata del parlato segue la lunghezza del perché a ~55 ms per
   carattere, il ritmo di una lettura ad alta voce. */
const T_SPECCHIO = 500;
const T_RADDRIZZA = 1500;
const T_PARLA = 2100;
const MS_PER_CARATTERE = 55;

export default function PrimoSchermo() {
  /* «fermo» = frase già dritta e perché già tutto scritto. È lo stato
     iniziale sul server e per chi chiede meno movimento: così l'HTML
     che arriva è completo e nessuno aspetta un'animazione per leggere. */
  const [fase, setFase] = useState<"fermo" | "specchio" | "raddrizza" | "parla" | "finito">("fermo");
  const [parla, setParla] = useState(false);
  const [detti, setDetti] = useState(ESEMPIO.perche.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tempi: number[] = [];
    const dopo = (ms: number, f: () => void) => tempi.push(window.setTimeout(f, ms));

    dopo(T_SPECCHIO, () => setFase("specchio"));
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

  const specchiata = fase === "specchio";

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
            {/* La copia a specchio: decorativa, nascosta a chi legge con lo
                schermo, appesa sotto la frase. Il testo vero è quello
                dritto qui sopra. */}
            <p className={`mj-correzione__specchio${specchiata ? " mj-correzione__specchio--viva" : ""}`} aria-hidden="true">
              {ESEMPIO.male}
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
