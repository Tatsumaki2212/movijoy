import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../../movijoy.css";
import Cornice from "../../components/Cornice";
import { utenteCorrente } from "../../lib/db";
import { clientePerUtente } from "../../lib/clienti";

/**
 * Scegli la tua password: obbligatorio dopo quella temporanea, e
 * possibile quando si vuole dalla barra dell'area privata.
 */

export const metadata: Metadata = {
  title: "La tua password",
  robots: { index: false, follow: false },
};

const ERRORI: Record<string, string> = {
  corta: "Almeno dieci caratteri.",
  email: "La password non può essere la tua email.",
  diverse: "Le due password non sono uguali.",
  salvataggio: "Non sono riuscito a salvarla. Riprova.",
};

export default async function Password({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const utente = await utenteCorrente();
  if (!utente) redirect("/entra");
  const cliente = await clientePerUtente(utente.id);
  const { errore } = await searchParams;
  const obbligatoria = Boolean(cliente?.password_da_cambiare);

  return (
    <Cornice dentro>
      <section className="mj-foglio mj-sezione mj-io">
        <p className="mj-blog__data">{utente.email}</p>
        <h1 className="mj-blog__titolo">{obbligatoria ? "Scegli la tua password." : "Cambia la password."}</h1>
        <p className="mj-blog__estratto">
          {obbligatoria
            ? "Quella che hai ricevuto per email valeva solo per entrare la prima volta. Scrivine una tua: almeno dieci caratteri."
            : "Almeno dieci caratteri. Vale da subito, anche su Che Livello! se hai un account con la stessa email."}
        </p>
        {errore && ERRORI[errore] && <p className="mj-modulo__stato">{ERRORI[errore]}</p>}

        <form className="mj-modulo mj-privato__modulo" method="post" action="/api/password">
          <input type="email" name="username" autoComplete="username" value={utente.email} readOnly hidden />
          <label className="mj-modulo__etichetta" htmlFor="nuova">
            La password nuova
          </label>
          <input id="nuova" name="nuova" type="password" autoComplete="new-password" required minLength={10} maxLength={200} className="mj-modulo__campo" />
          <label className="mj-modulo__etichetta" htmlFor="ripeti">
            Ripetila
          </label>
          <input id="ripeti" name="ripeti" type="password" autoComplete="new-password" required minLength={10} maxLength={200} className="mj-modulo__campo" />
          <button type="submit" className="mj-tasto">
            Salva la password
          </button>
          {!obbligatoria && (
            <p className="mj-modulo__nota">
              <Link href="/io">Torna a Movijoy</Link>
            </p>
          )}
        </form>
      </section>
    </Cornice>
  );
}
