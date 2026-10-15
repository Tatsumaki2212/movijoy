import { CHELIVELLO, NOME_CHELIVELLO } from "../lib/sito";
import type { Cliente, Scheda } from "../lib/clienti";

/**
 * I moduli della configurazione, uno per tipo di account.
 *
 * «Per me»: domande su di sé — perché scrive in inglese, che cosa
 * scrive, come vuole suonare, cosa lo mette in difficoltà. Niente
 * «azienda», niente «reparti»: chi ha comprato per sé non deve
 * sentirsi capitato nel modulo di un ufficio acquisti.
 *
 * «Organizzazione»: domande sull'azienda — nome, settore, sito, chi
 * scrive e a chi, quante persone, il tono della casa, il glossario.
 *
 * Le due schede finiscono nelle stesse colonne (SQL 49 e 53) e il
 * motore le legge con schedaInProsa, che sa quale delle due ha davanti.
 */

const DATA = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });

/** Telefono e termini: in fondo a tutti e due i moduli. */
export function Contatto({ cliente }: { cliente: Cliente }) {
  return (
    <>
      <label className="mj-modulo__etichetta" htmlFor="telefono">
        Un numero di telefono per la chiamata di configurazione compresa (facoltativo)
      </label>
      <input id="telefono" name="telefono" type="tel" autoComplete="tel" className="mj-modulo__campo" maxLength={40} defaultValue={cliente.telefono ?? ""} placeholder="+39 …" />

      {cliente.termini_accettati_il ? (
        <p className="mj-modulo__nota">
          Termini di servizio e privacy di {NOME_CHELIVELLO} accettati il {DATA.format(new Date(cliente.termini_accettati_il))}.
        </p>
      ) : (
        <label className="mj-privato__consenso">
          <input type="checkbox" name="termini" value="si" required />
          <span>
            Accetto i{" "}
            <a href={`${CHELIVELLO}/termini`} target="_blank" rel="noopener">
              termini di servizio
            </a>{" "}
            e l&apos;
            <a href={`${CHELIVELLO}/privacy`} target="_blank" rel="noopener">
              informativa sulla privacy
            </a>{" "}
            di {NOME_CHELIVELLO}, la società dietro Movijoy.
          </span>
        </label>
      )}
    </>
  );
}

function Varieta({ s }: { s: Scheda | null }) {
  return (
    <div className="mj-scelte mj-scelte--radio">
      <label>
        <input type="radio" name="varieta" value="british" defaultChecked={!s || s.varieta !== "american"} /> British
      </label>
      <label>
        <input type="radio" name="varieta" value="american" defaultChecked={s?.varieta === "american"} /> American
      </label>
    </div>
  );
}

const PERCHE = [
  ["lavoro", "Per lavoro"],
  ["studio", "Per lo studio o un esame"],
  ["viaggio", "Per viaggiare o vivere all'estero"],
  ["piacere", "Per me, senza una scadenza"],
] as const;

const SCRIVI = [
  ["email", "Email"],
  ["messaggi", "Messaggi e chat"],
  ["documenti", "Documenti, relazioni, presentazioni"],
  ["social", "Post e social"],
  ["scuola", "Compiti, tesi, candidature"],
] as const;

const TONO = [
  ["cordiale", "Cordiale"],
  ["formale", "Formale"],
  ["diretto", "Diretto, poche parole"],
  ["mio", "Come mi viene: correggi, non cambiare il mio modo"],
] as const;

export function FormPersona({ cliente, s, prima }: { cliente: Cliente; s: Scheda | null; prima: boolean }) {
  return (
    <form className="mj-modulo mj-io__scheda" method="post" action="/api/configura">
      <input type="hidden" name="tipo" value="persona" />

      <p className="mj-modulo__etichetta">1. Perché scrivi in inglese?</p>
      <div className="mj-scelte mj-scelte--radio mj-scelte--colonna">
        {PERCHE.map(([v, t]) => (
          <label key={v}>
            <input type="radio" name="perche" value={v} defaultChecked={(s?.perche ?? "lavoro") === v} /> {t}
          </label>
        ))}
      </div>
      <label className="mj-modulo__etichetta" htmlFor="lavoro">
        In due parole, cosa fai (facoltativo)
      </label>
      <input id="lavoro" name="lavoro" className="mj-modulo__campo" maxLength={200} defaultValue={s?.lavoro ?? ""} placeholder="Infermiera; studente di ingegneria; export manager" />

      <p className="mj-modulo__etichetta">2. Che cosa scrivi più spesso?</p>
      <div className="mj-scelte mj-scelte--radio mj-scelte--colonna">
        {SCRIVI.map(([v, t]) => (
          <label key={v}>
            <input type="radio" name="scrivi" value={v} defaultChecked={(s?.scrivi ?? "email") === v} /> {t}
          </label>
        ))}
      </div>

      <p className="mj-modulo__etichetta">3. Inglese britannico o americano?</p>
      <Varieta s={s} />

      <p className="mj-modulo__etichetta">4. Come vuoi suonare?</p>
      <div className="mj-scelte mj-scelte--radio mj-scelte--colonna">
        {TONO.map(([v, t]) => (
          <label key={v}>
            <input type="radio" name="tono" value={v} defaultChecked={(s?.tono ?? "cordiale") === v} /> {t}
          </label>
        ))}
      </div>

      <label className="mj-modulo__etichetta" htmlFor="difficolta">
        5. Che cosa ti mette più in difficoltà quando scrivi in inglese?
      </label>
      <textarea id="difficolta" name="difficolta" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={800} defaultValue={s?.difficolta ?? ""} placeholder="I tempi verbali; le preposizioni; non so mai se suono scortese" />

      <label className="mj-modulo__etichetta" htmlFor="non_toccare">
        Nomi e parole da non toccare mai (facoltativo: una per riga o separate da virgola)
      </label>
      <textarea id="non_toccare" name="non_toccare" className="mj-modulo__campo mj-modulo__campo--lungo" rows={2} maxLength={1000} defaultValue={s?.non_toccare.join(", ") ?? ""} placeholder="Il nome del tuo cane, un soprannome, una sigla" />

      <label className="mj-modulo__etichetta" htmlFor="note">
        Altro che Movijoy deve sapere di te (facoltativo)
      </label>
      <textarea id="note" name="note" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={1500} defaultValue={s?.note ?? ""} />

      <Contatto cliente={cliente} />

      <button type="submit" className="mj-tasto">
        {prima ? "Salva e comincia" : "Salva la scheda"}
      </button>
    </form>
  );
}

export function FormOrganizzazione({ cliente, s, prima }: { cliente: Cliente; s: Scheda | null; prima: boolean }) {
  return (
    <form className="mj-modulo mj-io__scheda" method="post" action="/api/configura">
      <input type="hidden" name="tipo" value="organizzazione" />

      <label className="mj-modulo__etichetta" htmlFor="azienda">
        1. Come si chiama l&apos;organizzazione?
      </label>
      <input id="azienda" name="azienda" className="mj-modulo__campo" maxLength={200} required defaultValue={s?.azienda ?? ""} placeholder="Rossi Macchine S.r.l." />

      <label className="mj-modulo__etichetta" htmlFor="settore">
        2. Di che cosa vi occupate?
      </label>
      <input id="settore" name="settore" className="mj-modulo__campo" maxLength={200} defaultValue={s?.settore ?? ""} placeholder="Macchine per il legno, vendute in Germania e negli Stati Uniti" />

      <label className="mj-modulo__etichetta" htmlFor="sito_web">
        3. Il vostro sito (Movijoy lo leggerà per copiare il vostro tono)
      </label>
      <input id="sito_web" name="sito_web" className="mj-modulo__campo" maxLength={300} defaultValue={s?.sito_web ?? ""} placeholder="www.rossimacchine.it" inputMode="url" />

      <label className="mj-modulo__etichetta" htmlFor="pubblico">
        4. Chi scrive in inglese, e a chi?
      </label>
      <input id="pubblico" name="pubblico" className="mj-modulo__campo" maxLength={300} defaultValue={s?.pubblico ?? ""} placeholder="Ufficio export e assistenza; clienti e fornitori esteri" />
      <label className="mj-modulo__etichetta" htmlFor="persone">
        Quante persone lo userebbero?
      </label>
      <input id="persone" name="persone" type="number" min={1} max={10000} inputMode="numeric" className="mj-modulo__campo" defaultValue={s?.persone ?? ""} placeholder="5" />

      <p className="mj-modulo__etichetta">5. Il tono della casa, e la varietà</p>
      <input id="tono" name="tono" className="mj-modulo__campo" maxLength={200} defaultValue={s?.tono ?? ""} placeholder="Cordiale ma diretto; formale con i clienti nuovi" />
      <Varieta s={s} />

      <label className="mj-modulo__etichetta" htmlFor="non_toccare">
        Il glossario: prodotti, nomi, termini interni da non toccare mai (una per riga o separate da virgola)
      </label>
      <textarea id="non_toccare" name="non_toccare" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={1000} defaultValue={s?.non_toccare.join(", ") ?? ""} placeholder="MovePro 3000, reparto Ricambi, FOB Genoa" />

      <label className="mj-modulo__etichetta" htmlFor="note">
        Altro (facoltativo)
      </label>
      <textarea id="note" name="note" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={1500} defaultValue={s?.note ?? ""} />

      <Contatto cliente={cliente} />

      <button type="submit" className="mj-tasto">
        {prima ? "Salva e chiedi l'accordo" : "Salva la scheda"}
      </button>
    </form>
  );
}
