"use client";

import { useEffect, useRef, useState } from "react";
import Sfera from "../components/Sfera";
import { tratto } from "../lib/memoria-chiavi";
import type { Annotazione, Testo } from "../lib/clienti";

/**
 * La chat con il motore: incolli un testo, Movijoy lo rende corretto
 * con le annotazioni. La stessa impostazione del dialogo della casa —
 * la sfera che muove la bocca mentre «dice» la correzione — ma qui
 * dall'altra parte c'è il motore vero.
 *
 * La storia che arriva dal server (gli ultimi venti testi) resta in
 * vista: una chat che dimentica quello che hai mandato non è un
 * registro.
 */

type Scambio = Pick<Testo, "originale" | "corretto" | "annotazioni" | "tono_nota" | "non_so"> & { id: string };

const MS = 12;

export default function Chat({ iniziali }: { iniziali: Testo[] }) {
  const [scambi, setScambi] = useState<Scambio[]>(iniziali.map((t) => ({ ...t })));
  const [testo, setTesto] = useState("");
  const [contesto, setContesto] = useState("email");
  const [inCorso, setInCorso] = useState(false);
  const [errore, setErrore] = useState("");
  const [vivo, setVivo] = useState<{ id: string; scritto: number } | null>(null);
  const fondo = useRef<HTMLDivElement | null>(null);

  const ultimo = scambi[scambi.length - 1];
  const parla = Boolean(vivo && ultimo && vivo.id === ultimo.id && vivo.scritto < ultimo.corretto.length);

  /* La battitura dell'ultima correzione arrivata, come nel dialogo. */
  useEffect(() => {
    if (!vivo || !ultimo || vivo.id !== ultimo.id) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = window.setTimeout(() => setVivo({ id: ultimo.id, scritto: ultimo.corretto.length }), 0);
      return () => window.clearTimeout(t);
    }
    const giro = window.setInterval(() => {
      setVivo((v) => {
        if (!v || v.id !== ultimo.id) return v;
        const n = Math.min(ultimo.corretto.length, v.scritto + 3);
        if (n >= ultimo.corretto.length) window.clearInterval(giro);
        return { id: v.id, scritto: n };
      });
    }, MS);
    return () => window.clearInterval(giro);
  }, [vivo?.id, ultimo]);

  useEffect(() => {
    fondo.current?.scrollIntoView({ block: "end" });
  }, [scambi.length, inCorso]);

  async function manda() {
    const t = testo.trim();
    if (!t || inCorso) return;
    setInCorso(true);
    setErrore("");
    try {
      const r = await fetch("/api/motore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testo: t, contesto }),
      });
      const corpo = (await r.json().catch(() => ({}))) as Partial<Scambio> & { errore?: string };
      if (!r.ok || !corpo.corretto) {
        setErrore(corpo.errore ?? "Non sono riuscito a correggere. Riprova fra un momento.");
        return;
      }
      const nuovo: Scambio = {
        id: corpo.id ?? String(Date.now()),
        originale: t,
        corretto: corpo.corretto,
        annotazioni: corpo.annotazioni ?? [],
        tono_nota: corpo.tono_nota ?? ((corpo as { tono?: string }).tono || null),
        non_so: corpo.non_so ?? [],
      };
      setScambi((s) => [...s, nuovo]);
      setVivo({ id: nuovo.id, scritto: 0 });
      setTesto("");
    } catch {
      setErrore("La rete non ha risposto. Riprova.");
    } finally {
      setInCorso(false);
    }
  }

  return (
    <div className="mj-dialogo mj-io__chat">
      <div className="mj-dialogo__sfera">
        <Sfera classe="mj-tela mj-tela--dialogo" parla={parla || inCorso} />
      </div>

      <div className="mj-dialogo__chat" aria-live="polite">
        {scambi.length === 0 && (
          <p className="mj-bolla mj-bolla--movijoy">
            Incolla qui sotto la prima email o il primo testo: te lo rendo corretto, con il perché di ogni cosa che
            cambio.
          </p>
        )}

        {scambi.map((s) => {
          const tutto = vivo?.id === s.id ? s.corretto.slice(0, vivo.scritto) : s.corretto;
          const finito = tutto.length >= s.corretto.length;
          return (
            <div key={s.id} className="mj-dialogo__scambio mj-io__scambio">
              <p className="mj-bolla mj-bolla--utente mj-io__originale">{s.originale}</p>
              <div className="mj-bolla mj-bolla--movijoy mj-io__corretto">
                <p className="mj-io__testo">
                  {tutto}
                  {!finito && <span className="mj-opera__cursore" aria-hidden="true" />}
                </p>
                {finito && (
                  <>
                    <Copia testo={s.corretto} />
                    {s.annotazioni.length > 0 ? (
                      <ol className="mj-correzione">
                        {s.annotazioni.map((a, n) => (
                          <Nota key={`${s.id}-${n}`} a={a} />
                        ))}
                      </ol>
                    ) : (
                      <p className="mj-io__nota">Niente da correggere.</p>
                    )}
                    {s.tono_nota && <p className="mj-io__tono">{s.tono_nota}</p>}
                    {s.non_so.length > 0 && (
                      <div className="mj-io__nonso">
                        <p>Quello che non so, e che ho lasciato com&apos;era — lo chiedo a una persona:</p>
                        <ul>
                          {s.non_so.map((d, n) => (
                            <li key={n}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {inCorso && <p className="mj-modulo__nota">Movijoy sta leggendo…</p>}

        <form
          className="mj-dialogo__risposta mj-io__modulo"
          onSubmit={(e) => {
            e.preventDefault();
            void manda();
          }}
        >
          <div className="mj-io__contesto">
            <label htmlFor="contesto" className="mj-modulo__etichetta">
              Che cos&apos;è
            </label>
            <select id="contesto" className="mj-modulo__campo" value={contesto} onChange={(e) => setContesto(e.target.value)}>
              <option value="email">Un&apos;email</option>
              <option value="offerta">Un&apos;offerta o un preventivo</option>
              <option value="documento">Un documento</option>
              <option value="messaggio">Un messaggio breve</option>
              <option value="altro">Altro</option>
            </select>
          </div>
          <label className="mj-modulo__etichetta" htmlFor="testo">
            Il testo
          </label>
          <textarea
            id="testo"
            className="mj-modulo__campo mj-modulo__campo--lungo"
            rows={6}
            maxLength={12000}
            value={testo}
            onChange={(e) => setTesto(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") void manda();
            }}
            placeholder="Dear Mr Schmidt, I write you to inform that…"
          />
          <button type="submit" className="mj-tasto" disabled={inCorso || !testo.trim()}>
            {inCorso ? "Un momento…" : "Correggi"}
          </button>
          <p className="mj-modulo__stato" role="status">
            {errore}
          </p>
        </form>
        <div ref={fondo} />
      </div>
    </div>
  );
}

function Nota({ a }: { a: Annotazione }) {
  const c = tratto(a.chiave);
  return (
    <li>
      <span className="mj-correzione__prima">{a.originale}</span>
      <span className="mj-correzione__dopo">{a.corretto}</span>
      <span className="mj-correzione__perche">
        {a.perche}
        {c ? <em> · {c.titolo}</em> : null}
      </span>
    </li>
  );
}

function Copia({ testo }: { testo: string }) {
  const [fatto, setFatto] = useState(false);
  return (
    <button
      type="button"
      className="mj-io__copia"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(testo);
          setFatto(true);
          window.setTimeout(() => setFatto(false), 1800);
        } catch {}
      }}
    >
      {fatto ? "Copiato" : "Copia il testo corretto"}
    </button>
  );
}
