"use client";

import { useEffect, useState } from "react";
import { ricordaVoce, voceDisponibile, vocePreferita } from "../lib/voce";

/**
 * Il tasto della voce, e lo stato che lo accompagna.
 *
 * `useVoce` risponde `null` finché non sa che cosa vuole chi ascolta
 * (sul server non può saperlo): il tasto compare solo dopo, così non
 * cambia etichetta sotto gli occhi. Dove la sintesi vocale non esiste
 * il tasto non compare affatto, e la voce è semplicemente spenta.
 *
 * È un <button> con aria-pressed, non un interruttore finto: chi usa la
 * tastiera lo trova, chi legge con lo schermo sa se è acceso.
 */
export function useVoce(): [boolean, () => void] {
  const [accesa, setAccesa] = useState<boolean | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setAccesa(voceDisponibile() ? vocePreferita() : false);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  const cambia = () => {
    setAccesa((v) => {
      const nuova = !v;
      ricordaVoce(nuova);
      return nuova;
    });
  };

  return [accesa === true, cambia];
}

export default function Voce({ accesa, cambia }: { accesa: boolean; cambia: () => void }) {
  const [pronta, setPronta] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPronta(voceDisponibile()), 0);
    return () => window.clearTimeout(t);
  }, []);
  if (!pronta) return null;

  return (
    <button type="button" className="mj-voce" aria-pressed={accesa} onClick={cambia}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
        <path d="M2.5 6h2.3L8.5 3v10L4.8 10H2.5z" />
        {accesa ? (
          <>
            <path d="M10.8 5.8a3 3 0 0 1 0 4.4" />
            <path d="M12.6 4a5.5 5.5 0 0 1 0 8" />
          </>
        ) : (
          <path d="M10.8 6l3 4M13.8 6l-3 4" />
        )}
      </svg>
      {accesa ? "Voce accesa" : "Voce spenta"}
    </button>
  );
}
