import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import Cornice from "../components/Cornice";

/** Dove torna chi ha pagato: la lettera con il link è già partita dal webhook. */

export const metadata: Metadata = {
  title: "Il tuo Movijoy è attivo",
  robots: { index: false, follow: false },
};

export default function Attivato() {
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-privato">
        <p className="mj-blog__data">Fatto</p>
        <h1 className="mj-blog__titolo">Il tuo Movijoy è attivo.</h1>
        <p className="mj-blog__estratto">
          Controlla la posta: all&apos;indirizzo che hai dato alla cassa ti ho mandato nome utente e password per
          entrare. Se fra due minuti non è arrivata, guarda nella posta indesiderata, oppure da{" "}
          <Link href="/entra">entra</Link> chiedi una password nuova.
        </p>
        <p className="mj-sezione__dice">
          Dentro ti faccio cinque domande su come scrivi, e poi è tuo.
        </p>
      </section>
    </Cornice>
  );
}
