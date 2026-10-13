"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sfera from "./Sfera";
import Voce, { useVoce } from "./Voce";
import { di } from "../lib/voce";
import { DOMANDE, frase as diceFrase, type Domanda } from "../lib/dialogo-frasi";

/**
 * Parla con Movijoy: le domande di profilazione, una per volta.
 *
 * Movijoy scrive la domanda lettera per lettera muovendo la bocca (la
 * stessa variabile `parla` dello shader), poi compare il campo o le
 * scelte. Le risposte restano qui finché non sono tutte; alla fine
 * partono in una richiesta sola verso /api/richiesta — la stessa
 * tabella delle richieste, perché è una richiesta: nome, email, per
 * chi, e un messaggio composto dalle risposte.
 *
 * ⚠️ NON È UN MODELLO: le domande sono scritte qui, in ordine, e non
 * cambiano in base a quello che la persona dice (tranne la quarta, che
 * dipende dalla seconda). Un dialogo a copione presentato come
 * intelligenza sarebbe la prima bugia del sito.
 *
 * ⚠️ NIENTE DATI NELL'INDIRIZZO: nome ed email passano alla pagina del
 * grazie in sessionStorage, mai nei parametri dell'URL.
 */

/* Il copione — domande e frasi — sta in lib/dialogo-frasi.ts, condiviso
   con la rotta della voce: il server pronuncia solo quello che c'è lì. */
function dice(d: Domanda, r: Record<string, string>): string {
  return diceFrase(d.id, { nome: r.nome, chi: r.chi });
}

const MS = 38;

export default function Dialogo() {
  const router = useRouter();
  const [passo, setPasso] = useState(0);
  const [risposte, setRisposte] = useState<Record<string, string>>({});
  const [scritto, setScritto] = useState(0);
  const [parla, setParla] = useState(false);
  const [valore, setValore] = useState("");
  const [errore, setErrore] = useState("");
  const [inInvio, setInInvio] = useState(false);
  const aperto = useRef(0);
  const campo = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const domanda = DOMANDE[passo];
  const frase = dice(domanda, risposte);
  const finita = scritto >= frase.length;
  const [voce, cambiaVoce] = useVoce();

  useEffect(() => {
    aperto.current = Date.now();
  }, []);

  /* La battitura e la voce partono insieme; la bocca si muove finché non
     hanno finito TUTTE E DUE. Senza voce — spenta, bloccata dal browser,
     o senza una voce italiana — la bocca segue la battitura. Tutto parte
     al tick dopo, mai in modo sincrono nel corpo dell'effetto. */
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
        ferma = di({ id: domanda.id, nome: risposte.nome, chi: risposte.chi }, frase, {
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
      setParla(false);
    };
  }, [frase, voce]);

  useEffect(() => {
    if (finita) campo.current?.focus();
  }, [finita, passo]);

  async function manda(tutte: Record<string, string>) {
    setInInvio(true);
    setErrore("");
    const messaggio = [
      `Scrive di più: ${tutte.uso || "—"}`,
      tutte.chi === "piattaforma" ? `La piattaforma: ${tutte.dettaglio || "—"}` : `Obiettivo: ${tutte.dettaglio || "—"}`,
      "(dal dialogo con Movijoy su movijoy.it)",
    ].join("\n");
    try {
      const r = await fetch("/api/richiesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: tutte.nome,
          email: tutte.email,
          chi: tutte.chi,
          messaggio,
          sito: "",
          aperto: aperto.current,
          origine: window.location.search.includes("utm_") ? window.location.search.slice(1, 200) : "",
        }),
      });
      const corpo = (await r.json().catch(() => ({}))) as { errore?: string };
      if (!r.ok) {
        setErrore(corpo.errore ?? "Non sono riuscito a mandare le risposte. Riprova fra un momento.");
        setInInvio(false);
        return;
      }
      try {
        sessionStorage.setItem("movijoy:grazie", JSON.stringify({ nome: tutte.nome, email: tutte.email }));
      } catch {}
      router.push("/grazie");
    } catch {
      setErrore("La rete non ha risposto. Riprova, o scrivi a principale@chelivello.it.");
      setInInvio(false);
    }
  }

  function rispondi(v: string) {
    const pulito = v.trim();
    if (!pulito) return;
    if (domanda.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(pulito)) {
      setErrore("Serve un indirizzo email a cui rispondere.");
      return;
    }
    const tutte = { ...risposte, [domanda.id]: pulito };
    setRisposte(tutte);
    setValore("");
    setErrore("");
    if (passo + 1 < DOMANDE.length) setPasso(passo + 1);
    else void manda(tutte);
  }

  return (
    <section className="mj-foglio mj-dialogo">
      <div className="mj-dialogo__sfera">
        <Sfera classe="mj-tela mj-tela--dialogo" parla={parla} />
      </div>

      <div className="mj-dialogo__chat" aria-live="polite">
        <Voce accesa={voce} cambia={cambiaVoce} />

        {/* Le domande già fatte e le risposte date restano in vista: un
            dialogo che cancella quello che hai detto non è un dialogo. */}
        {DOMANDE.slice(0, passo).map((d) => (
          <div key={d.id} className="mj-dialogo__scambio">
            <p className="mj-bolla mj-bolla--movijoy">{dice(d, risposte)}</p>
            <p className="mj-bolla mj-bolla--utente">
              {d.tipo === "scelta" ? d.scelte.find((s) => s.v === risposte[d.id])?.t : risposte[d.id]}
            </p>
          </div>
        ))}

        <p className="mj-bolla mj-bolla--movijoy mj-bolla--viva">
          {frase.slice(0, scritto)}
          {!finita && <span className="mj-opera__cursore" aria-hidden="true" />}
        </p>

        {finita && !inInvio && (
          <form
            className="mj-dialogo__risposta"
            onSubmit={(e) => {
              e.preventDefault();
              rispondi(valore);
            }}
          >
            {domanda.tipo === "scelta" ? (
              <div className="mj-scelte">
                {domanda.scelte.map((s) => (
                  <button key={s.v} type="button" className="mj-tasto mj-tasto--vuoto" onClick={() => rispondi(s.v)}>
                    {s.t}
                  </button>
                ))}
              </div>
            ) : domanda.tipo === "lungo" ? (
              <>
                <label className="mj-modulo__etichetta" htmlFor="risposta">
                  {domanda.campo}
                </label>
                <textarea
                  id="risposta"
                  ref={(el) => {
                    campo.current = el;
                  }}
                  className="mj-modulo__campo mj-modulo__campo--lungo"
                  rows={3}
                  maxLength={1500}
                  value={valore}
                  onChange={(e) => setValore(e.target.value)}
                />
                <button type="submit" className="mj-tasto">
                  Avanti
                </button>
              </>
            ) : (
              <>
                <label className="mj-modulo__etichetta" htmlFor="risposta">
                  {domanda.campo}
                </label>
                <input
                  id="risposta"
                  ref={(el) => {
                    campo.current = el;
                  }}
                  className="mj-modulo__campo"
                  type={domanda.tipo === "email" ? "email" : "text"}
                  autoComplete={domanda.tipo === "email" ? "email" : "name"}
                  maxLength={200}
                  value={valore}
                  onChange={(e) => setValore(e.target.value)}
                />
                <button type="submit" className="mj-tasto">
                  {passo + 1 < DOMANDE.length ? "Avanti" : "Manda a Movijoy"}
                </button>
              </>
            )}
          </form>
        )}

        {inInvio && <p className="mj-modulo__nota">Movijoy sta mandando le tue risposte…</p>}
        <p className="mj-modulo__stato" role="status">
          {errore}
        </p>
      </div>
    </section>
  );
}
