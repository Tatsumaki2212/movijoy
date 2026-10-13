"use client";

import { useEffect, useState } from "react";
import Sfera from "./Sfera";
import Voce, { useVoce } from "./Voce";
import { di } from "../lib/voce";

/**
 * Il grazie di Movijoy, detto muovendo la bocca. Nome ed email arrivano
 * da sessionStorage (mai dall'indirizzo); senza, la frase è generica.
 */
const MS = 38;

export default function Grazie() {
  const [chi, setChi] = useState<{ nome?: string; email?: string }>({});
  const [scritto, setScritto] = useState<number | null>(null);
  const [parla, setParla] = useState(false);

  useEffect(() => {
    /* Al tick dopo, non in modo sincrono dentro l'effetto. */
    const t = window.setTimeout(() => {
      try {
        const v = sessionStorage.getItem("movijoy:grazie");
        if (v) setChi(JSON.parse(v) as { nome?: string; email?: string });
      } catch {}
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const frase = `Grazie${chi.nome ? `, ${chi.nome}` : ""}. Le tue risposte sono arrivate. Che Livello! le legge e ti scrive${chi.email ? ` a ${chi.email}` : ""}, di solito in giornata.`;

  const [voce, cambiaVoce] = useVoce();

  /* Battitura e voce insieme, bocca in moto finché non finiscono tutte e
     due — lo stesso schema del dialogo. Il grazie arriva con una
     navigazione interna, quindi il gesto dell'ultimo clic vale ancora e
     la voce può partire da sola. */
  useEffect(() => {
    const fermo = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let giro = 0;
    let ferma = () => {};
    let battituraFinita = false;
    let voceFinita = !voce;
    const chiudi = () => {
      if (battituraFinita && voceFinita) setParla(false);
    };
    const avvio = window.setTimeout(() => {
      if (voce) {
        ferma = di(frase, {
          allaFine: () => {
            voceFinita = true;
            chiudi();
          },
        });
      }
      if (fermo) {
        setScritto(frase.length);
        battituraFinita = true;
        if (voce) setParla(true);
        chiudi();
        return;
      }
      setScritto(0);
      setParla(true);
      let i = 0;
      giro = window.setInterval(() => {
        i += 1;
        setScritto(i);
        if (i >= frase.length) {
          window.clearInterval(giro);
          battituraFinita = true;
          chiudi();
        }
      }, MS);
    }, 0);
    return () => {
      window.clearTimeout(avvio);
      window.clearInterval(giro);
      ferma();
    };
  }, [frase, voce]);

  const mostrato = scritto === null ? frase.length : scritto;

  return (
    <section className="mj-foglio mj-dialogo">
      <div className="mj-dialogo__sfera">
        <Sfera classe="mj-tela mj-tela--dialogo" parla={parla} />
      </div>
      <div className="mj-dialogo__chat">
        <Voce accesa={voce} cambia={cambiaVoce} />
        <h1 className="mj-sezione__titolo">Ricevuto.</h1>
        <p className="mj-bolla mj-bolla--movijoy mj-bolla--viva">
          {frase.slice(0, mostrato)}
          {mostrato < frase.length && <span className="mj-opera__cursore" aria-hidden="true" />}
        </p>
        <p className="mj-modulo__nota">
          Intanto, se vuoi vedere di nuovo come lavora: <a href="/all-opera">Movijoy all&apos;opera</a>.
        </p>
      </div>
    </section>
  );
}
