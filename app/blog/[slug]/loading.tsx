import "../../movijoy.css";
import Cornice from "../../components/Cornice";

/**
 * Il confine di sospensione della pagina dell'articolo. Con
 * `cacheComponents` lo slug nell'indirizzo è un dato a tempo
 * d'esecuzione: senza un confine, la build si rifiuta di prerenderizzare
 * la rotta. Questo è il guscio che arriva subito; l'articolo lo segue.
 */
export default function Caricamento() {
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-blog" aria-busy="true">
        <p className="mj-blog__data">Blog</p>
      </section>
    </Cornice>
  );
}
