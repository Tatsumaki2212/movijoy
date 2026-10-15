import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import Chat from "./Chat";
import { utenteCorrente } from "../lib/db";
import { clientePerUtente, schedaDi, ultimiTesti } from "../lib/clienti";

/**
 * L'area privata: il tuo Movijoy.
 *
 * Chi non è collegato va a /entra. Chi è collegato ma non ha un Movijoy
 * lo sa subito, con la porta per attivarlo. Chi ce l'ha ma non ha
 * ancora fatto le cinque domande va a configurarlo. Tutti gli altri:
 * la chat con il motore.
 */

export const metadata: Metadata = {
  title: "Il tuo Movijoy",
  robots: { index: false, follow: false },
};

export default async function Io({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const utente = await utenteCorrente();
  if (!utente) redirect("/entra");
  const cliente = await clientePerUtente(utente.id);
  const { errore } = await searchParams;

  if (!cliente) {
    return (
      <Cornice>
        <section className="mj-foglio mj-sezione mj-io">
          <p className="mj-blog__data">{utente.email}</p>
          <h1 className="mj-blog__titolo">Questo indirizzo non ha ancora un Movijoy.</h1>
          <p className="mj-blog__estratto">
            Se l&apos;hai attivato con un&apos;altra email, entra con quella. Altrimenti{" "}
            <Link href="/privato">attivalo qui</Link>.
          </p>
          <Uscita />
        </section>
      </Cornice>
    );
  }

  if (cliente.stato !== "attivo") {
    return (
      <Cornice>
        <section className="mj-foglio mj-sezione mj-io">
          <p className="mj-blog__data">{cliente.email}</p>
          <h1 className="mj-blog__titolo">
            {cliente.stato === "chiuso" ? "Il tuo Movijoy è chiuso." : "Il tuo Movijoy è in pausa."}
          </h1>
          <p className="mj-blog__estratto">
            {cliente.stato === "chiuso"
              ? "L'abbonamento è stato disdetto. La tua scheda e la tua memoria restano qui: se vuoi riattivarlo, basta ripartire."
              : "L'ultimo pagamento non è andato a buon fine. Dal conto puoi aggiornare la carta: appena il pagamento passa, Movijoy riparte da solo."}
          </p>
          <div className="mj-io__azioni">
            {cliente.stripe_cliente && (
              <form method="post" action="/api/portale">
                <button type="submit" className="mj-tasto">
                  Vai al conto
                </button>
              </form>
            )}
            {cliente.stato === "chiuso" && (
              <Link className="mj-tasto mj-tasto--vuoto" href="/privato">
                Riattiva
              </Link>
            )}
          </div>
          <Uscita />
        </section>
      </Cornice>
    );
  }

  const scheda = await schedaDi(cliente.id);
  if (!scheda) redirect("/io/configura");

  const testi = await ultimiTesti(cliente.id, 20);

  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-io">
        <div className="mj-io__barra">
          <p className="mj-blog__data">
            Il tuo Movijoy · {cliente.nome ?? cliente.email}
          </p>
          <nav className="mj-io__voci" aria-label="Il tuo conto">
            <Link href="/io/configura">La scheda</Link>
            <form method="post" action="/api/portale">
              <button type="submit">Il conto</button>
            </form>
            <form method="post" action="/api/esci">
              <button type="submit">Esci</button>
            </form>
          </nav>
        </div>
        {errore === "conto" && <p className="mj-modulo__stato">Il conto non si apre: scrivi a principale@chelivello.it.</p>}
        <Chat iniziali={testi} />
      </section>
    </Cornice>
  );
}

function Uscita() {
  return (
    <form method="post" action="/api/esci" className="mj-io__uscita">
      <button type="submit" className="mj-tasto mj-tasto--vuoto">
        Esci
      </button>
    </form>
  );
}
