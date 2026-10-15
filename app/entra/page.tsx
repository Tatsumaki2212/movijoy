import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import { redirect } from "next/navigation";
import Cornice from "../components/Cornice";
import { utenteCorrente } from "../lib/db";

/**
 * «Entra»: l'email, e arriva il link. Nessuna password da ricordare.
 * La pagina risponde sempre allo stesso modo (vedi api/entra): se
 * l'indirizzo ha un Movijoy, la lettera è partita.
 */

export const metadata: Metadata = {
  title: "Entra nel tuo Movijoy",
  robots: { index: false, follow: false },
};

export default async function Entra({ searchParams }: { searchParams: Promise<{ mandato?: string; errore?: string }> }) {
  if (await utenteCorrente()) redirect("/io");
  const { mandato, errore } = await searchParams;
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-privato">
        <p className="mj-blog__data">Entra</p>
        <h1 className="mj-blog__titolo">Il tuo Movijoy.</h1>
        {mandato ? (
          <p className="mj-blog__estratto">
            Se quell&apos;indirizzo ha un Movijoy, il link per entrare è partito: vale un&apos;ora e una volta sola.
          </p>
        ) : (
          <p className="mj-blog__estratto">Scrivi l&apos;email con cui hai attivato Movijoy: ti mando il link per entrare.</p>
        )}
        {errore === "scaduto" && <p className="mj-modulo__stato">Quel link era già usato o scaduto: te ne mando uno nuovo.</p>}
        {errore === "email" && <p className="mj-modulo__stato">Serve un indirizzo email.</p>}
        {errore === "link" && <p className="mj-modulo__stato">L&apos;ingresso non è configurato: scrivi a principale@chelivello.it.</p>}
        <form className="mj-modulo mj-privato__modulo" method="post" action="/api/entra">
          <label className="mj-modulo__etichetta" htmlFor="email">
            La tua email
          </label>
          <input id="email" name="email" type="email" autoComplete="email" required className="mj-modulo__campo" maxLength={200} />
          <button type="submit" className="mj-tasto">
            Mandami il link
          </button>
          <p className="mj-modulo__nota">
            Non hai ancora un Movijoy? <Link href="/privato">Attivalo</Link>.
          </p>
        </form>
      </section>
    </Cornice>
  );
}
