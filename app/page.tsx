import type { Metadata } from "next";
import "./movijoy.css";
import Sfera from "./components/Sfera";
import { NOME_SITO, CHELIVELLO, NOME_CHELIVELLO } from "./lib/sito";
import { SOCIETA, rigaSocieta } from "./lib/societa";
import { TITOLARE } from "./lib/titolare";

/**
 * movijoy.it — la casa.
 *
 * STESSA INTERFACCIA DI chelivello.it/movijoy, ALTRO MESTIERE. La
 * struttura è quella, sezione per sezione: apertura con la sfera, le
 * tre cifre, i sei calchi, le quattro cose che fa, le quattro che non
 * sa in colonna doppia, il piede. Ma quella pagina presenta una
 * funzione del registro a chi è già sul portale; questa presenta
 * MOVIJOY COME PRODOTTO a chi arriva da fuori, e vive in un sito suo.
 *
 * ⚠️ QUESTA PAGINA NON VENDE IL REGISTRO. Decisione di Lorenzo del 13
 * ottobre 2026: «movijoy.it non deve vendere il registro, deve vendere
 * Movijoy». Quindi qui non c'è nessun tasto verso gli abbonamenti di
 * chelivello, nessun prezzo del registro, nessun «compreso
 * nell'abbonamento», e nei dati strutturati non c'è `offers`.
 * L'OFFERTA DI MOVIJOY NON È ANCORA DEFINITA: i due posti in cui andrà
 * — il blocco `mj-azioni` nell'apertura e la sezione di chiusura —
 * sono vuoti e segnati qui sotto con ⚠️ OFFERTA. Si riempiono quando
 * l'offerta esiste, non prima, e con quella.
 *
 * ⚠️ NIENTE PROMESSE CHE DIPENDONO DALL'OFFERTA. «Senza limiti», «senza
 * crediti da contare», un prezzo: sono proprietà di un abbonamento,
 * non del software. Qui si dice solo quello che il software FA.
 *
 * ⚠️ OGNI NUMERO E OGNI FRASE È VERA. I sei calchi — sbagliato, giusto
 * e perché — sono copiati testualmente dai moduli di grammatica di
 * chelivello (app/lib/grammatica/, il modulo è nel commento di
 * ciascuno) e sono sei diversi dai sei della pagina del portale: due
 * domini con le stesse frasi si fanno concorrenza da soli.
 *
 * ⚠️ LA MEMORIA NON È NOMINATA, né come cosa che fa né come limite: il
 * portale la elenca fra le cose che non sa, ma il codice di
 * /api/correggi la manda nel prompt a ogni correzione. Finché non è
 * chiarito quale delle due sia vera, qui non se ne parla.
 */

export const metadata: Metadata = {
  /* `absolute` scavalca il modello «%s — Movijoy» del layout: sulla
     casa il nome c'è già nel titolo, e ripeterlo in coda è rumore nel
     risultato di ricerca. */
  title: {
    absolute: "Movijoy — l'intelligenza artificiale che corregge il tuo inglese scritto",
  },
  description:
    "Mandi quello che hai scritto e Movijoy te lo corregge sui criteri ufficiali Cambridge e IELTS in venti secondi, con il motivo accanto a ogni riga. A qualunque ora. E ti dice anche quello che non sa fare.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: NOME_SITO,
    title: "Movijoy — ti corregge l'inglese scritto, riga per riga",
    description:
      "Correzione sui criteri ufficiali Cambridge e IELTS in venti secondi, con il perché accanto a ogni riga. E dice quello che non sa fare.",
  },
};

/* I calchi: sbagliato, giusto e perché sono presi TESTUALMENTE dai
   moduli di grammatica di chelivello (il nome del modulo è nel
   commento). Sei lezioni diverse, e nessuna delle sei del portale. */
const CALCHI = [
  {
    /* past-simple */
    male: "I didn't went to the party.",
    bene: "I didn't go to the party.",
    perche:
      "Dopo did il verbo torna all'infinito: il passato è già dentro l'ausiliare. Metterlo due volte è l'errore più comune dopo la -s della terza persona.",
  },
  {
    /* present-perfect-continuous */
    male: "How long are you learning English?",
    bene: "How long have you been learning English?",
    perche:
      "«Da quanto tempo studi inglese?» in italiano è al presente. In inglese la domanda sulla durata vuole il perfect continuous.",
  },
  {
    /* past-perfect */
    male: "If I would have known, I would have come.",
    bene: "If I had known, I would have come.",
    perche:
      "Dopo «if» non si mette mai «would». È il calco di «se avrei saputo», che in italiano è sbagliato pure lui.",
  },
  {
    /* used-to */
    male: "I am used to go to the gym.",
    bene: "I'm used to going to the gym.",
    perche:
      "Dopo «be used to» ci va la -ing, perché «to» qui è una preposizione e non l'infinito. È il calco più frequente di tutta la lezione.",
  },
  {
    /* going-to */
    male: "Look at those clouds! It will rain.",
    bene: "Look at those clouds! It's going to rain.",
    perche:
      "Con una prova sotto gli occhi ci vuole going to. Will è per la previsione che nasce da un'opinione, non da quello che vedi.",
  },
  {
    /* presente-per-futuro */
    male: "What time will the film start?",
    bene: "What time does the film start?",
    perche: "L'orario è stampato sul programma: present simple.",
  },
];

/* Quello che Movijoy fa OGGI, in rete, adesso: i quattro motori che
   esistono nel software. Se l'offerta di Movijoy ne comprenderà meno
   di quattro, questo elenco si accorcia nello stesso momento. */
const OGGI = [
  {
    titolo: "Corregge quello che scrivi",
    testo:
      "Una email, un essay, una lettera formale: torna con le bande sui quattro criteri Cambridge o sulle nove bande IELTS, e il motivo accanto a ogni riga segnata. Riscrivi, lo rimandi, lo rilegge.",
  },
  {
    titolo: "Costruisce gli esercizi sui tuoi errori",
    testo:
      "Non una scheda uguale per tutti: esercizi generati sulle parti in cui perdi punti tu, nel formato esatto della prova.",
  },
  {
    titolo: "Ti ascolta e giudica il parlato",
    testo:
      "Parli al microfono, Movijoy trascrive e valuta la lingua sul trascritto: lessico, grammatica, organizzazione del discorso.",
  },
  {
    titolo: "Scrive il piano della settimana",
    testo:
      "Da qui a domenica, costruito sui tuoi risultati veri: le bande basse, le parti dove perdi punti, i giorni che mancano alla scadenza.",
  },
];

/* ⚠️ STESSO PESO GRAFICO DELL'ALTRA COLONNA, di proposito. Dire i
   limiti ad alta voce è un principio del prodotto: una pagina che li
   mette in fondo in grigio chiaro lo tradisce fingendo di rispettarlo.
   Su un dominio dove nessuno ci conosce, è anche l'unica ragione per
   credere al resto. */
const NON_SA = [
  {
    titolo: "La pronuncia",
    testo:
      "Il parlato arriva come trascrizione, e in una trascrizione la pronuncia non c'è più. Su questo serve un orecchio umano.",
  },
  {
    titolo: "La parte in coppia dello Speaking",
    testo:
      "Richiede un esaminatore che reagisce e un secondo candidato. Simularla male darebbe un punteggio rassicurante su una prova che poi va in un altro modo.",
  },
  {
    titolo: "Che cosa volevi dire",
    testo:
      "Se una frase è ambigua, corregge quella che hai scritto: non indovina l'intenzione. Sta a te riscriverla finché dice la cosa che intendevi.",
  },
  {
    titolo: "Rilasciare un certificato",
    testo:
      "Dà le bande con i criteri ufficiali alla mano, ma un esame lo rilascia Cambridge o chi gestisce l'IELTS, non noi. Movijoy ti dice se sei pronto, non che hai passato.",
  },
];

export default function Casa() {
  /* ⚠️ SENZA `offers`, finché l'offerta non esiste. Dichiarare a Google
     un prezzo che non è quello di Movijoy sarebbe la prima bugia del
     dominio, e la più visibile. */
  const datiStrutturati = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: NOME_SITO,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "it",
    description:
      "Intelligenza artificiale che corregge l'inglese scritto sui criteri ufficiali Cambridge e IELTS, genera esercizi sugli errori di chi studia e valuta il parlato sul trascritto.",
    publisher: {
      "@type": "Organization",
      name: SOCIETA.denominazione,
      url: CHELIVELLO,
    },
  };

  return (
    <div className="mj">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datiStrutturati) }}
      />
      <a href="#contenuto" className="salta">
        Salta al contenuto
      </a>

      <div className="mj-foglio">
        <header className="mj-barra">
          <span className="mj-marchio">
            Movijoy<span>.</span>
          </span>
          <div className="mj-barra__dati">
            <span className="mj-etichetta">Correzione dello scritto</span>
            <span className="mj-etichetta">Criteri Cambridge · IELTS</span>
            <span className="mj-etichetta">Attivo adesso</span>
          </div>
        </header>
      </div>

      <main id="contenuto">
        {/* ── Il primo schermo ──────────────────────────────── */}
        <section className="mj-foglio mj-apertura">
          <Sfera classe="mj-tela" />

          <div className="mj-apertura__testo">
            {/* ⚠️ PAROLE CORTE: a questa scala una parola lunga da sola
                è più larga della colonna e spinge tutto sotto la piega. */}
            <h1 className="mj-titolo">
              Scrivi.
              <br />
              Ti dico dove
              <br />
              <em>perdi il punto.</em>
            </h1>
            <p className="mj-apertura__dice">
              Movijoy è un&apos;intelligenza artificiale che corregge
              l&apos;inglese scritto. Mandi quello che hai scritto — una email
              a un cliente, un essay, una lettera — e in{" "}
              <strong>venti secondi</strong> torna corretto sui criteri
              ufficiali Cambridge e IELTS, riga per riga, con il motivo
              accanto a ogni correzione. A qualunque ora, e senza farti pesare
              che è la quarta volta che riscrivi la stessa email.
            </p>
            {/* ⚠️ OFFERTA — QUI VA IL BLOCCO `mj-azioni`: i tasti e il
                prezzo di Movijoy. Resta vuoto finché l'offerta non è
                definita. NON metterci nel frattempo un rimando al
                registro o al test di chelivello. */}
          </div>
        </section>

        {/* ── Le cifre ──────────────────────────────────────── */}
        <section className="mj-foglio mj-riga-filo">
          <div className="mj-conta">
            <div>
              <span className="mj-cifra">20″</span>
              <span className="mj-etichetta">Per una correzione</span>
              <p>
                Quanto ci mette a renderti un testo con le bande e le note a
                margine. A una persona ne costa quindici, di minuti: per questo
                ovunque le correzioni sono poche e si aspettano.
              </p>
            </div>
            <div>
              <span className="mj-cifra">4 e 9</span>
              <span className="mj-etichetta">I criteri veri</span>
              <p>
                I quattro criteri con cui Cambridge valuta il Writing, e le nove
                bande dell&apos;IELTS. Non una griglia nostra: quella con cui ti
                leggerà l&apos;esaminatore.
              </p>
            </div>
            <div>
              <span className="mj-cifra">Riga per riga</span>
              <span className="mj-etichetta">Il perché, non solo il rosso</span>
              <p>
                Ogni correzione porta accanto il motivo: quale regola, e da
                quale frase italiana nasce l&apos;errore. Un segno rosso insegna
                a copiare la correzione; il perché insegna a non rifarlo.
              </p>
            </div>
          </div>
        </section>

        {/* ── La prova ──────────────────────────────────────── */}
        <section className="mj-foglio mj-sezione">
          <h2 className="mj-sezione__titolo">
            Non sbagli a caso. Sbagli in italiano.
          </h2>
          <p className="mj-sezione__dice">
            Gli errori che fa un italiano in inglese non sono distrazioni: sono
            italiano applicato all&apos;inglese, e tornano sempre uguali finché
            non si vede da dove nascono. Movijoy li riconosce per quello che
            sono. Questi sei vengono dalle sue lezioni di grammatica, non sono
            inventati per questa pagina.
          </p>

          <div className="mj-prove">
            {CALCHI.map((c) => (
              <div className="mj-prova" key={c.male}>
                <p className="mj-prova__male">{c.male}</p>
                <p className="mj-prova__bene">{c.bene}</p>
                <p className="mj-prova__perche">{c.perche}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Cosa fa, oggi ─────────────────────────────────── */}
        <section className="mj-campo">
          <div className="mj-foglio mj-sezione">
            <h2 className="mj-sezione__titolo">Quattro cose, tutti i giorni.</h2>
            <p className="mj-sezione__dice">
              Non è un chatbot a cui chiedere consigli: sono quattro mestieri
              precisi, e li fa mentre tu lavori sul tuo inglese.
            </p>
            <ul className="mj-elenco">
              {OGGI.map((o) => (
                <li key={o.titolo}>
                  <b>{o.titolo}</b>
                  {o.testo}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── E cosa non fa ─────────────────────────────────── */}
        <section className="mj-foglio mj-sezione">
          <div className="mj-due">
            <div>
              <h2 className="mj-sezione__titolo">
                E quattro che non sa fare.
              </h2>
              <p className="mj-sezione__dice">
                Un assistente che promette tutto viene creduto su niente.
                Queste stanno scritte qui, con lo stesso peso delle altre,
                perché sono la ragione per cui puoi fidarti del resto della
                pagina.
              </p>
            </div>
            <ul className="mj-elenco mj-elenco--limiti">
              {NON_SA.map((n) => (
                <li key={n.titolo}>
                  <b>{n.titolo}</b>
                  {n.testo}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ⚠️ OFFERTA — QUI VA LA CHIUSURA: `mj-foglio mj-chiusura
            mj-riga-filo`, con il titolo, una riga sull'offerta e il blocco
            `mj-azioni`. Dirà come si compra Movijoy, quando esisterà un
            modo. Fino ad allora la pagina finisce con i limiti, che è un
            finale onesto. */}

        {/* ── Il piede ──────────────────────────────────────── */}
        <div className="mj-foglio">
          <footer className="mj-piede">
            {/* ⚠️ CHI STA DIETRO, per esteso. Su un sito che porterà a un
                pagamento la legge (art. 2250 c.c.) chiede che sia scritto
                chi vende; su un dominio nuovo è anche la sola cosa che
                distingue un prodotto da una pagina comparsa dal nulla. La
                riga su incassi e ricevute segue la regola di lib/titolare.ts.
                Le pagine legali stanno su chelivello.it e nominano anche
                questo dominio: una copia sola, apposta. */}
            <span className="mj-etichetta">
              {rigaSocieta()} · incassi e ricevute: {TITOLARE.nome}, P. IVA{" "}
              {TITOLARE.partitaIva}
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
              Non affiliato né approvato da Cambridge University Press &amp;
              Assessment, dal British Council o da IDP IELTS. I marchi citati
              appartengono ai rispettivi titolari.
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
