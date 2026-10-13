import Link from "next/link";
import { CHELIVELLO, NOME_CHELIVELLO } from "../lib/sito";
import { rigaSocieta } from "../lib/societa";
import { TITOLARE } from "../lib/titolare";

/**
 * La cornice di ogni pagina di movijoy.it: la barra in cima e il piede.
 * Una sola copia, così le tre pagine del percorso (casa, all'opera,
 * parla, grazie) non divergono. Che Livello! compare solo nel piede,
 * come società: decisione di Lorenzo del 13 ottobre 2026.
 */
export default function Cornice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mj">
      <a href="#contenuto" className="salta">
        Salta al contenuto
      </a>
      <div className="mj-foglio mj-testa">
        <header className="mj-barra">
          <Link href="/" className="mj-marchio">
            Movijoy<span>.</span>
          </Link>
          <div className="mj-barra__dati">
            <span className="mj-etichetta">Correzione dello scritto</span>
            <span className="mj-etichetta">Criteri Cambridge · IELTS</span>
            <span className="mj-etichetta">Risposta in venti secondi</span>
          </div>
        </header>
      </div>

      <main id="contenuto">{children}</main>

      <div className="mj-foglio">
        <footer className="mj-piede">
          <span className="mj-etichetta">
            {rigaSocieta()} · incassi e ricevute: {TITOLARE.nome}, P. IVA {TITOLARE.partitaIva}
          </span>
          <span className="mj-barra__dati">
            <a href={CHELIVELLO} className="mj-etichetta">
              {NOME_CHELIVELLO}
            </a>
            <a href={`${CHELIVELLO}/privacy`} className="mj-etichetta">
              Privacy
            </a>
            <a href={`${CHELIVELLO}/cookie-policy`} className="mj-etichetta">
              Cookie
            </a>
            <a href={`${CHELIVELLO}/termini`} className="mj-etichetta">
              Termini
            </a>
            <a href={`mailto:${TITOLARE.email}`} className="mj-etichetta">
              {TITOLARE.email}
            </a>
          </span>
          <span className="mj-etichetta">
            Non affiliato né approvato da Cambridge University Press &amp; Assessment, dal British
            Council o da IDP IELTS. I marchi citati appartengono ai rispettivi titolari.
          </span>
        </footer>
      </div>
    </div>
  );
}
