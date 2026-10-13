import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import DemoOpera from "../components/DemoOpera";

/**
 * Movijoy all'opera: due scene animate — l'assistente privato che
 * corregge una email, e Movijoy sul sito di un cliente che risponde
 * con i criteri di quel cliente — e un tasto solo, verso il dialogo.
 * Niente video e niente GIF: sequenze scritte dal vivo in HTML.
 */

export const metadata: Metadata = {
  title: "Movijoy all'opera",
  description:
    "Come lavora Movijoy: corregge una email riga per riga con il perché, e risponde sul sito di un cliente con i criteri di quel cliente.",
  alternates: { canonical: "/all-opera" },
};

export default function AllOpera() {
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione">
        <h1 className="mj-sezione__titolo">Movijoy all&apos;opera.</h1>
        <p className="mj-sezione__dice">
          Due scene, scritte dal vivo. La prima è l&apos;assistente privato: una
          email a un cliente, corretta riga per riga con il perché. La seconda
          è Movijoy sul sito di un&apos;azienda — un esempio, non un cliente —
          che risponde a un visitatore con i criteri di quell&apos;azienda.
        </p>
        <div className="mj-opere">
          <DemoOpera scena="personale" />
          <DemoOpera scena="sito" />
        </div>
      </section>

      <section className="mj-foglio mj-chiusura mj-riga-filo">
        <h2 className="mj-titolo">
          Ora parla
          <br />
          <em>con lui.</em>
        </h2>
        <p className="mj-apertura__dice" style={{ margin: "0 auto 2.25rem" }}>
          Cinque domande, un minuto: Movijoy ti chiede chi sei e che cosa ti
          serve, e Lorenzo e Gaspare ti rispondono.
        </p>
        <div className="mj-azioni">
          {/* <Link>, non <a>: la navigazione interna conserva il gesto del
              clic, e sul dialogo la voce può partire senza un secondo
              tocco. */}
          <Link href="/parla" className="mj-tasto">
            Parla con Movijoy
          </Link>
        </div>
      </section>
    </Cornice>
  );
}
