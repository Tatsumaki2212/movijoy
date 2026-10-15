import type { Metadata } from "next";
import Link from "next/link";
import "./movijoy.css";
import PrimoSchermo from "./components/PrimoSchermo";
import { NOME_SITO, CHELIVELLO, NOME_CHELIVELLO } from "./lib/sito";
import { SOCIETA, rigaSocieta } from "./lib/societa";
import { TITOLARE } from "./lib/titolare";

/**
 * movijoy.it — la casa.
 *
 * Composizione scelta da Lorenzo il 13 ottobre 2026 sulla pagina di
 * scelta di Impeccable: «Il piano riflettente». Il contratto di
 * direzione — tesi, mondo, storia, primo schermo, forma, finish — sta
 * in .impeccable/surfaces/app-page-tsx.md e NON va copiato qui: questa
 * è la pagina, non il suo brief.
 *
 * ⚠️ QUESTA PAGINA NON VENDE IL REGISTRO. Nessun tasto verso gli
 * abbonamenti di chelivello, nessun prezzo, nessun «compreso
 * nell'abbonamento», niente `offers` nei dati strutturati. L'azione è
 * una richiesta: chiedono, Che Livello! risponde. L'OFFERTA di
 * Movijoy non è ancora definita: quando lo sarà, il posto segnato
 * ⚠️ OFFERTA qui sotto prende il prezzo e come si compra.
 *
 * ⚠️ OGNI NUMERO E OGNI FRASE È VERA. I calchi vengono testualmente dai
 * moduli di grammatica di chelivello (app/lib/grammatica/) e sono
 * diversi da quelli della pagina del portale. La memoria non è
 * nominata, né come cosa che fa né come limite. Nessun cliente, nessun
 * «usato da»: non esistono ancora.
 */

export const metadata: Metadata = {
  title: {
    absolute: "Movijoy — l'intelligenza artificiale che corregge il tuo inglese scritto",
  },
  description:
    "Mandi quello che hai scritto e Movijoy te lo corregge sui criteri ufficiali Cambridge e IELTS in venti secondi, con il motivo accanto a ogni riga. Con i tuoi criteri, sulla tua piattaforma o solo per te.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: NOME_SITO,
    title: "Movijoy — un assistente di inglese con i tuoi criteri",
    description:
      "Corregge l'inglese scritto sui criteri ufficiali, riga per riga, con il perché. Sulla tua piattaforma o solo per te.",
  },
};

/* I calchi: sbagliato, giusto e perché copiati TESTUALMENTE dai moduli
   di grammatica di chelivello (il modulo è nel commento). Sei lezioni
   diverse, nessuna delle sei del portale, e nessuna uguale a quella
   del primo schermo. */
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

/* Quello che Movijoy fa OGGI: i quattro motori che esistono. Se
   l'offerta ne comprenderà meno, questo elenco si accorcia nello stesso
   momento. */
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

/* ⚠️ STESSO PESO GRAFICO DELL'ALTRA COLONNA, di proposito: dire i
   limiti ad alta voce è un principio del prodotto, e su un dominio dove
   nessuno ci conosce è l'unica ragione per credere al resto. */
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
  /* ⚠️ SENZA `offers`, finché l'offerta non esiste. */
  const datiStrutturati = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: NOME_SITO,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    inLanguage: "it",
    description:
      "Intelligenza artificiale che corregge l'inglese scritto sui criteri ufficiali Cambridge e IELTS con criteri di risposta definiti per ogni cliente, genera esercizi sugli errori e valuta il parlato sul trascritto.",
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

      {/* La barra sta SOPRA la tela del primo schermo, che le passa
          sotto: un oggetto solo, senza un gradino tonale fra i due. */}
      <div className="mj-foglio mj-testa">
        <header className="mj-barra">
          <span className="mj-marchio">
            Movijoy<span>.</span>
          </span>
          <div className="mj-barra__dati">
            <span className="mj-etichetta">Agente IA dedicato</span>
            <span className="mj-etichetta">Criteri Cambridge · IELTS</span>
            {/* ⚠️ Niente «Attivo adesso»: afferma uno stato vivo che su
                questo dominio non si può provare. Venti secondi è una
                misura vera del motore. */}
            <span className="mj-etichetta">Risposte rapide senza credito</span>
          </div>
          <Link href="/entra" className="mj-barra__accedi">
            Accedi
          </Link>
        </header>
      </div>

      <main id="contenuto">
        {/* ── Il primo schermo: la sfera, il piano, la correzione, la targa ── */}
        <PrimoSchermo />

        {/* ── Due porte, lo stesso motore ───────────────────────── */}
        <section className="mj-foglio mj-sezione mj-riga-filo">
          <h2 className="mj-sezione__titolo">Due porte. Lo stesso motore.</h2>
          <p className="mj-sezione__dice">
            Movijoy è un&apos;intelligenza artificiale per l&apos;inglese con criteri
            di risposta definiti per chi lo usa — non un chatbot a cui chiedere
            consigli. Lo stesso motore entra da due porte.
          </p>
          <div className="mj-porte">
            <div>
              <h3 className="mj-sezione__titolo">Sulla tua piattaforma</h3>
              <p className="mj-sezione__dice">
                Un&apos;azienda, una scuola, un sito. Movijoy risponde ai tuoi
                utenti con i criteri che decidi tu: il tuo tono, i tuoi casi, le
                parole che usi. I criteri li definiamo insieme e li mettiamo
                noi sulla tua piattaforma: un accordo per cliente, non un
                prodotto da scaffale.
              </p>
              <a className="mj-porte__vai" href="/all-opera">
                Vedilo su un sito
              </a>
            </div>
            <div>
              <h3 className="mj-sezione__titolo">Il tuo assistente privato</h3>
              <p className="mj-sezione__dice">
                Una persona sola. Il tuo Movijoy, configurato su di te e sui
                tuoi obiettivi: corregge in venti secondi, spiega riga per riga
                da quale frase italiana nasce l&apos;errore, e dice quello che
                non sa fare. Riservato: non si mescola con quello di nessun
                altro.
              </p>
              <Link className="mj-porte__vai" href="/privato">
                Attiva il tuo Movijoy
              </Link>
            </div>
          </div>
          {/* L'offerta del privato, decisa il 13 ottobre 2026 e in cassa
              dal 15: si compra da soli su /privato. Per le piattaforme
              resta la richiesta: l'offerta è ancora da definire. */}
          <p className="mj-porte__offerta">
            <strong>Il tuo assistente privato</strong> si attiva da solo: 199,99 € di configurazione, poi
            49,99 € al mese, senza vincolo. <Link href="/privato">Attivalo</Link> ·{" "}
            <Link href="/entra">Hai già un Movijoy? Entra</Link>
          </p>
        </section>

        {/* ── La prova: errori veri, con la correzione ──────────── */}
        <section className="mj-foglio mj-sezione mj-riga-filo">
          <h2 className="mj-sezione__titolo">Non sbagli a caso. Sbagli in italiano.</h2>
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

        {/* ── Cosa fa, oggi ─────────────────────────────────────── */}
        <section className="mj-campo">
          <div className="mj-foglio mj-sezione">
            <h2 className="mj-sezione__titolo">Quattro cose, tutti i giorni.</h2>
            <p className="mj-sezione__dice">
              Sono quattro mestieri precisi, e li fa mentre tu lavori sul tuo
              inglese — o mentre ci lavorano i tuoi utenti.
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

        {/* ── E cosa non fa ─────────────────────────────────────── */}
        <section className="mj-foglio mj-sezione">
          <div className="mj-due">
            <div>
              <h2 className="mj-sezione__titolo">E quattro che non sa fare.</h2>
              <p className="mj-sezione__dice">
                Un assistente che promette tutto viene creduto su niente. Queste
                stanno scritte qui, con lo stesso peso delle altre, perché sono
                la ragione per cui puoi fidarti del resto della pagina.
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

        {/* ── La chiusura: vederlo, poi parlarci ───────────────── */}
        <section className="mj-foglio mj-chiusura mj-riga-filo">
          <h2 className="mj-titolo">
            Vedilo lavorare.
            <br />
            <em>Poi parlaci.</em>
          </h2>
          <p className="mj-apertura__dice" style={{ margin: "0 auto 2.25rem" }}>
            Non c&apos;è un prezzo da scaffale, perché non c&apos;è un Movijoy uguale
            per tutti: i criteri si definiscono per chi lo usa. Guardalo
            all&apos;opera, poi rispondi alle sue cinque domande: ti scrive
            Che Livello!.
          </p>
          <div className="mj-azioni">
            <a href="/all-opera" className="mj-tasto">
              Vedi Movijoy all&apos;opera
            </a>
            <Link href="/parla" className="mj-tasto mj-tasto--vuoto">
              Vai dritto al dialogo
            </Link>
          </div>
        </section>

        {/* ── Il piede ──────────────────────────────────────────── */}
        <div className="mj-foglio">
          <footer className="mj-piede">
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
