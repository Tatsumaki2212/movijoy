"use client";

import { useEffect, useId, useRef, useState } from "react";
import { CHELIVELLO } from "../lib/sito";

/**
 * Il modulo della richiesta: l'azione della pagina.
 *
 * Due vesti, un solo invio. «targa» è la corsia veloce nel primo
 * schermo: la sola email e «Scrivimi». «completo» è il modulo in fondo
 * alla pagina: nome, email, chi sei, due righe. Tutti e due finiscono
 * in /api/richiesta, che salva nel database e avvisa chi risponde.
 *
 * ⚠️ CONTRO I ROBOT, DUE COSE CHE UN UMANO NON VEDE: un campo `sito`
 * nascosto (chi lo compila è un copione) e l'ora in cui il modulo è
 * stato aperto (chi invia dopo due secondi non ha letto niente). Il
 * server le controlla; qui si mandano e basta.
 *
 * ⚠️ GLI STATI SONO QUATTRO E SI VEDONO TUTTI: a riposo, in invio,
 * riuscito, fallito — con il motivo e la via d'uscita, mai un «errore»
 * nudo. Il messaggio di stato è in una regione viva, così chi legge con
 * lo schermo lo sente senza cercarlo.
 */

type Stato =
  | { tipo: "riposo" }
  | { tipo: "invio" }
  | { tipo: "fatto" }
  | { tipo: "errore"; perche: string };

export default function Richiesta({
  variante,
  chiPreselezionato,
}: {
  variante: "targa" | "completo";
  chiPreselezionato?: "piattaforma" | "privato";
}) {
  const id = useId();
  const [stato, setStato] = useState<Stato>({ tipo: "riposo" });
  const [chi, setChi] = useState<"piattaforma" | "privato" | "">(chiPreselezionato ?? "");
  const aperto = useRef(0);

  useEffect(() => {
    aperto.current = Date.now();
    /* Se la pagina arriva da un annuncio, l'origine si conserva per la
       richiesta: è l'unica misura che conta su un sito che vende con un
       contatto. Niente cookie, niente identificativo: la stringa dei
       parametri e basta, e sparisce con la scheda. */
  }, []);

  async function invia(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (stato.tipo === "invio") return;
    const dati = new FormData(e.currentTarget);
    const origine =
      typeof window !== "undefined" && window.location.search.includes("utm_")
        ? window.location.search.slice(1, 200)
        : "";

    setStato({ tipo: "invio" });
    try {
      const r = await fetch("/api/richiesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: dati.get("nome") ?? "",
          email: dati.get("email") ?? "",
          chi: chi || null,
          messaggio: dati.get("messaggio") ?? "",
          sito: dati.get("sito") ?? "",
          aperto: aperto.current,
          origine,
        }),
      });
      const corpo = (await r.json().catch(() => ({}))) as { errore?: string };
      if (!r.ok) {
        setStato({
          tipo: "errore",
          perche: corpo.errore ?? "Non sono riuscito a mandare la richiesta. Riprova fra un momento.",
        });
        return;
      }
      setStato({ tipo: "fatto" });
    } catch {
      setStato({
        tipo: "errore",
        perche: "La rete non ha risposto. Riprova, o scrivi a principale@chelivello.it.",
      });
    }
  }

  if (stato.tipo === "fatto") {
    return (
      <div className={`mj-modulo mj-modulo--${variante} mj-modulo--fatto`} role="status" aria-live="polite">
        <p className="mj-modulo__fatto">
          <strong>Ricevuta.</strong> Rispondono Lorenzo e Gaspare, non un sistema
          {variante === "targa" ? " — ti scrivono all'indirizzo che hai lasciato." : ", di solito in giornata."}
        </p>
      </div>
    );
  }

  const inInvio = stato.tipo === "invio";

  return (
    <form className={`mj-modulo mj-modulo--${variante}`} onSubmit={invia} noValidate>
      {/* Il campo trappola: fuori dallo schermo, fuori dal tab, ignorato
          dagli autocompilatori per via del nome e dell'autocomplete. */}
      <div className="mj-modulo__trappola" aria-hidden="true">
        <label htmlFor={`${id}-sito`}>Sito</label>
        <input id={`${id}-sito`} name="sito" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {variante === "completo" && (
        <div className="mj-modulo__riga">
          <label className="mj-modulo__etichetta" htmlFor={`${id}-nome`}>
            Come ti chiami
          </label>
          <input
            id={`${id}-nome`}
            name="nome"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            className="mj-modulo__campo"
            placeholder="Nome e cognome"
          />
        </div>
      )}

      <div className={variante === "targa" ? "mj-modulo__fila" : "mj-modulo__riga"}>
        <label className="mj-modulo__etichetta" htmlFor={`${id}-email`}>
          {variante === "targa" ? "La tua email" : "Dove rispondiamo"}
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          maxLength={200}
          className="mj-modulo__campo"
          placeholder="nome@azienda.it"
        />
        {variante === "targa" && (
          <button type="submit" className="mj-tasto" disabled={inInvio} aria-busy={inInvio}>
            {inInvio ? "Mando…" : "Scrivimi"}
          </button>
        )}
      </div>

      {variante === "completo" && (
        <>
          <fieldset className="mj-modulo__chi">
            <legend className="mj-modulo__etichetta">Per chi è</legend>
            <div className="mj-modulo__porte">
              <label className={`mj-porta${chi === "piattaforma" ? " mj-porta--scelta" : ""}`}>
                <input
                  type="radio"
                  name="chi"
                  value="piattaforma"
                  checked={chi === "piattaforma"}
                  onChange={() => setChi("piattaforma")}
                />
                <span>
                  <b>Per la mia piattaforma</b>
                  Un&apos;azienda, una scuola, un sito: Movijoy per i miei utenti, con i miei criteri.
                </span>
              </label>
              <label className={`mj-porta${chi === "privato" ? " mj-porta--scelta" : ""}`}>
                <input
                  type="radio"
                  name="chi"
                  value="privato"
                  checked={chi === "privato"}
                  onChange={() => setChi("privato")}
                />
                <span>
                  <b>Per me</b>
                  Il mio assistente privato di inglese, sui miei obiettivi.
                </span>
              </label>
            </div>
          </fieldset>

          <div className="mj-modulo__riga">
            <label className="mj-modulo__etichetta" htmlFor={`${id}-messaggio`}>
              Che cosa ti serve, in due righe
            </label>
            <textarea
              id={`${id}-messaggio`}
              name="messaggio"
              rows={4}
              maxLength={2000}
              className="mj-modulo__campo mj-modulo__campo--lungo"
              placeholder="Per esempio: i miei commerciali scrivono a clienti tedeschi e inglesi, e le offerte escono con errori che si vedono."
            />
          </div>

          <div className="mj-modulo__fila mj-modulo__fila--fine">
            <button type="submit" className="mj-tasto" disabled={inInvio} aria-busy={inInvio}>
              {inInvio ? "Mando…" : "Manda la richiesta"}
            </button>
            <p className="mj-modulo__nota">
              I dati servono a risponderti e a nient&apos;altro:{" "}
              <a href={`${CHELIVELLO}/privacy`}>l&apos;informativa</a>.
            </p>
          </div>
        </>
      )}

      {variante === "targa" && (
        <p className="mj-modulo__nota">
          Rispondono Lorenzo e Gaspare, non un sistema. Nessun prezzo da scaffale: si parla.
        </p>
      )}

      <p className="mj-modulo__stato" role="status" aria-live="polite">
        {stato.tipo === "errore" ? stato.perche : ""}
      </p>
    </form>
  );
}
