import "../movijoy.css";
import Cornice from "../components/Cornice";

/** Il confine di sospensione dell'area privata: legge i cookie, quindi
    è dinamica, e con cacheComponents serve un guscio che arrivi subito. */
export default function Caricamento() {
  return (
    <Cornice dentro>
      <section className="mj-foglio mj-sezione mj-io" aria-busy="true">
        <p className="mj-blog__data">Il tuo Movijoy</p>
      </section>
    </Cornice>
  );
}
