"use client";

import { useEffect, useState } from "react";

/**
 * Movijoy all'opera: due dimostrazioni animate, non due GIF.
 *
 * Sono sequenze scritte dal vivo in HTML — il testo che viene battuto,
 * le correzioni che compaiono riga per riga, il perché accanto — e non
 * video: pesano niente, si leggono nitide su qualunque schermo, e chi
 * legge con lo schermo riceve il testo intero.
 *
 * ⚠️ OGNI CORREZIONE È VERA: sbagliato, giusto e perché vengono dai
 * moduli di grammatica di chelivello (app/lib/grammatica/). L'azienda
 * della seconda scena è dichiarata «esempio» in pagina: nessun cliente
 * esiste ancora, e nessuno deve crederlo.
 *
 * ⚠️ CON MENO MOVIMENTO CHIESTO DAL SISTEMA tutto è già scritto, fermo.
 */

const MS = 32;

type Riga = { male: string; bene: string; perche: string };

const PERSONALE: { testo: string; righe: Riga[] } = {
  testo: "Dear Mr Keller, within Friday I will finish the report. I didn't went to the meeting, so when you will arrive I will update you.",
  righe: [
    {
      male: "within Friday I will finish the report",
      bene: "by Friday I'll have finished the report",
      perche: "«Entro venerdì» si dice by Friday, non within Friday. Within vuol dire «nel giro di».",
    },
    {
      male: "I didn't went to the meeting",
      bene: "I didn't go to the meeting",
      perche: "Dopo did il verbo torna all'infinito: il passato è già dentro l'ausiliare.",
    },
    {
      male: "when you will arrive",
      bene: "when you arrive",
      perche: "Dopo when, if e as soon as il futuro non si usa: un solo will per frase.",
    },
  ],
};

const SITO = {
  cliente: "Esempio: un'azienda di logistica",
  criteri: ["Tono diretto, dà del tu", "Mail a clienti esteri", "Segnala i calchi dall'italiano"],
  domanda: "Devo scrivere a un cliente tedesco che la consegna slitta a lunedì. Come lo dico?",
  risposta:
    "Scrivi: «The delivery will arrive on Monday instead of Friday.» Non «within Monday»: entro un giorno preciso è by. E niente «we are sorry for the inconvenient»: inconvenience, con la -ce. Vuoi che ti riscriva tutta la mail?",
};

function useBattitura(testo: string, attivo: boolean, ritardo = 0) {
  const [n, setN] = useState(testo.length);
  useEffect(() => {
    if (!attivo) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let giro = 0;
    /* L'azzeramento sta dentro il timer, non nel corpo dell'effetto: un
       setState sincrono lì è un render a cascata (react-hooks/
       set-state-in-effect), e un tick di ritardo non si vede. */
    const parti = window.setTimeout(() => {
      setN(0);
      giro = window.setInterval(() => {
        i += 1;
        setN(i);
        if (i >= testo.length) window.clearInterval(giro);
      }, MS);
    }, ritardo);
    return () => {
      window.clearTimeout(parti);
      window.clearInterval(giro);
    };
  }, [testo, attivo, ritardo]);
  return n;
}

export default function DemoOpera({ scena }: { scena: "personale" | "sito" }) {
  const [parte, setParte] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setParte(true), 300);
    return () => window.clearTimeout(t);
  }, []);

  if (scena === "personale") {
    return <ScenaPersonale attivo={parte} />;
  }
  return <ScenaSito attivo={parte} />;
}

function ScenaPersonale({ attivo }: { attivo: boolean }) {
  const scritto = useBattitura(PERSONALE.testo, attivo);
  const finito = scritto >= PERSONALE.testo.length;
  return (
    <div className="mj-opera">
      <div className="mj-opera__testa">
        <span className="mj-etichetta">Assistente privato · la tua email</span>
      </div>
      <p className="mj-opera__testo">
        {PERSONALE.testo.slice(0, scritto)}
        <span className="mj-opera__cursore" aria-hidden="true" />
      </p>
      <ul className={`mj-opera__righe${finito ? " mj-opera__righe--vive" : ""}`}>
        {PERSONALE.righe.map((r, i) => (
          <li key={r.male} style={{ transitionDelay: `${i * 0.35}s` }}>
            <span className="mj-opera__male">{r.male}</span>
            <span className="mj-opera__bene">{r.bene}</span>
            <span className="mj-opera__perche">{r.perche}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ScenaSito({ attivo }: { attivo: boolean }) {
  const domanda = useBattitura(SITO.domanda, attivo, 200);
  const risposta = useBattitura(SITO.risposta, attivo && domanda >= SITO.domanda.length, 500);
  return (
    <div className="mj-opera mj-opera--sito">
      <div className="mj-opera__testa">
        <span className="mj-etichetta">Sul sito di un cliente · {SITO.cliente}</span>
      </div>
      <div className="mj-opera__criteri">
        <span className="mj-etichetta">Criteri del cliente</span>
        {SITO.criteri.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </div>
      <div className="mj-opera__chat">
        <p className="mj-bolla mj-bolla--utente">{SITO.domanda.slice(0, domanda)}</p>
        <p className="mj-bolla mj-bolla--movijoy">
          <b>Movijoy</b>
          {SITO.risposta.slice(0, risposta)}
          {risposta < SITO.risposta.length && <span className="mj-opera__cursore" aria-hidden="true" />}
        </p>
      </div>
    </div>
  );
}
