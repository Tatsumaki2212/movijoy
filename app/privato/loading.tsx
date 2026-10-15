import "../movijoy.css";
import Cornice from "../components/Cornice";

/** Il confine di sospensione: la pagina legge l'esito della cassa dall'indirizzo. */
export default function Caricamento() {
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-privato" aria-busy="true">
        <p className="mj-blog__data">Il tuo assistente privato</p>
      </section>
    </Cornice>
  );
}
