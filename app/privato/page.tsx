import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import { CONFIGURAZIONE_TESTO, MENSILE_TESTO } from "../lib/stripe";
import { SITO } from "../lib/sito";

/**
 * L'offerta del privato, e la cassa. Decisa da Lorenzo il 13 ottobre
 * 2026: configurazione una tantum + manutenzione mensile dal primo
 * mese, senza vincolo, niente annuale. Il prezzo si mostra: un privato
 * non chiama per sapere quanto costa, chiude la pagina.
 *
 * ⚠️ OGNI RIGA DICE UNA COSA CHE ESISTE. Il tagliando è automatico, la
 * voce non c'è ancora e non è promessa, la chiamata con Gaspare si
 * prenota dall'area privata.
 */

export const metadata: Metadata = {
  title: "Il tuo assistente privato",
  description:
    "Movijoy privato: l'inglese che scrivi per lavoro, corretto nel tuo registro, con la tua scheda dei criteri. 199,99 € di configurazione, 49,99 € al mese, senza vincolo.",
  alternates: { canonical: `${SITO}/privato` },
};

export default async function Privato({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const { errore } = await searchParams;
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-privato">
        <p className="mj-blog__data">Il tuo assistente privato</p>
        <h1 className="mj-blog__titolo">L&apos;inglese che scrivi per lavoro, corretto come lo scriveresti tu.</h1>
        <p className="mj-blog__estratto">
          Una email, un&apos;offerta, un documento: lo mandi a Movijoy e torna corretto, con il perché riga
          per riga, nel tuo registro — British o American, formale o no, le parole della tua azienda
          lasciate stare. Movijoy si ricorda di quello che sbagli tu, non di quello che sbagliano tutti.
        </p>

        <div className="mj-privato__prezzi">
          <div className="mj-privato__prezzo">
            <p className="mj-blog__data">Configurazione, una volta</p>
            <p className="mj-privato__cifra">{CONFIGURAZIONE_TESTO}</p>
            <ul className="mj-privato__lista">
              <li>Cinque domande per dirgli come scrivi: lavoro, varietà, tono, a chi scrivi, le parole da non toccare mai.</li>
              <li>La tua scheda dei criteri: la vedi, la correggi, è tua.</li>
              <li>La chiamata di quaranta minuti con una persona di Che Livello!, compresa: si prenota da dentro.</li>
            </ul>
          </div>
          <div className="mj-privato__prezzo">
            <p className="mj-blog__data">Manutenzione, ogni mese</p>
            <p className="mj-privato__cifra">
              {MENSILE_TESTO}<span>/mese</span>
            </p>
            <ul className="mj-privato__lista">
              <li>Correzioni in venti secondi, con il perché e la chiave di ogni errore, fino a cento testi al mese.</li>
              <li>La memoria dei tuoi errori: quelli che tornano, quante volte, e quando smettono.</li>
              <li>Quello che Movijoy non sa — un termine tuo, una scelta che dipende da fatti suoi — lo dice, e lo chiede a una persona.</li>
              <li>Senza vincolo: si disdice dal conto, in un clic.</li>
            </ul>
          </div>
        </div>

        {errore === "email" && (
          <p className="mj-modulo__stato">Quell&apos;indirizzo email non sembra esistere: controlla come l&apos;hai scritto, o lascia vuoto.</p>
        )}
        {errore === "consenso" && <p className="mj-modulo__stato">Per attivare serve la spunta sull&apos;avvio immediato della configurazione.</p>}
        {errore === "cassa" && <p className="mj-modulo__stato">La cassa non ha risposto. Riprova, o scrivi a principale@chelivello.it.</p>}
        <form className="mj-modulo mj-privato__modulo" method="post" action="/api/compra">
          <label className="mj-modulo__etichetta" htmlFor="email">
            La tua email di lavoro (facoltativa: la cassa la chiede comunque)
          </label>
          <input id="email" name="email" type="email" autoComplete="email" className="mj-modulo__campo" maxLength={200} />
          <label className="mj-privato__consenso">
            <input type="checkbox" name="consenso" value="si" required />
            <span>
              Chiedo che la configurazione parta subito e so che, una volta partita, non è rimborsabile; la
              manutenzione la disdico quando voglio.
            </span>
          </label>
          <button type="submit" className="mj-tasto">
            Attiva il tuo Movijoy
          </button>
          <p className="mj-modulo__nota">
            Pagamento con carta su Stripe. Fattura intestabile alla tua azienda: partita IVA alla cassa. Hai già un
            Movijoy? <Link href="/entra">Entra</Link>.
          </p>
        </form>
      </section>

      <section className="mj-foglio mj-sezione mj-riga-filo mj-privato__dubbi">
        <h2 className="mj-sezione__titolo">Perché non ChatGPT?</h2>
        <p className="mj-sezione__dice">
          Perché non sa niente di te. Movijoy ha la tua scheda, scritta con te; la memoria dei tuoi errori, con le
          frasi vere da cui nascono; e una persona dietro che risponde quando lui non sa. Il modello sotto è un
          fornitore, e lo è per tutti allo stesso prezzo. Lo storico no.
        </p>
        <h2 className="mj-sezione__titolo">Cosa non fa</h2>
        <p className="mj-sezione__dice">
          Non inventa fatti della tua azienda. Non valuta la pronuncia. Non ti parla ancora a voce. Non sostituisce
          chi ti tiene in riga quando molleresti: per quello c&apos;è la chiamata, e c&apos;è Che Livello!.
        </p>
        <p className="mj-sezione__dice">
          Vuoi vederlo prima? <Link href="/all-opera">Guarda Movijoy all&apos;opera</Link>.
        </p>
      </section>
    </Cornice>
  );
}
