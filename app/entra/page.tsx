import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import { redirect } from "next/navigation";
import Cornice from "../components/Cornice";
import { utenteCorrente } from "../lib/db";

/**
 * «Entra»: email e password. Il nome utente è l'email; la prima
 * password arriva per email appena il Movijoy è attivo, e al primo
 * accesso si sceglie la propria. Chi l'ha dimenticata ne chiede una
 * nuova dallo stesso posto.
 */

export const metadata: Metadata = {
  title: "Entra nel tuo Movijoy",
  robots: { index: false, follow: false },
};

export default async function Entra({
  searchParams,
}: {
  searchParams: Promise<{ mandata?: string; errore?: string }>;
}) {
  if (await utenteCorrente()) redirect("/io");
  const { mandata, errore } = await searchParams;
  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-privato">
        <p className="mj-blog__data">Entra</p>
        <h1 className="mj-blog__titolo">Il tuo Movijoy.</h1>
        <p className="mj-blog__estratto">Il nome utente è l&apos;email con cui l&apos;hai attivato.</p>
        {mandata && (
          <p className="mj-modulo__stato">
            Se quell&apos;indirizzo ha un Movijoy, la password nuova è partita per email.
          </p>
        )}
        {errore === "password" && <p className="mj-modulo__stato">Email o password non giuste.</p>}
        {errore === "troppi" && <p className="mj-modulo__stato">Troppi tentativi: aspetta un quarto d&apos;ora, o chiedi una password nuova qui sotto.</p>}
        {errore === "email" && <p className="mj-modulo__stato">Quell&apos;indirizzo non sembra esistere: controlla come l&apos;hai scritto.</p>}
        {errore === "link" && <p className="mj-modulo__stato">L&apos;ingresso non è configurato: scrivi a principale@chelivello.it.</p>}

        <form className="mj-modulo mj-privato__modulo" method="post" action="/api/entra">
          <label className="mj-modulo__etichetta" htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" autoComplete="username" required className="mj-modulo__campo" maxLength={200} />
          <label className="mj-modulo__etichetta" htmlFor="password">
            Password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="mj-modulo__campo" maxLength={200} />
          <button type="submit" className="mj-tasto">
            Entra
          </button>
        </form>

        <form className="mj-modulo mj-privato__modulo mj-entra__dimenticata" method="post" action="/api/password-dimenticata">
          <p className="mj-modulo__nota">Password dimenticata? Scrivi l&apos;email e te ne mando una nuova.</p>
          <label className="mj-modulo__etichetta" htmlFor="email-dimenticata">
            Email
          </label>
          <input id="email-dimenticata" name="email" type="email" autoComplete="username" required className="mj-modulo__campo" maxLength={200} />
          <button type="submit" className="mj-tasto mj-tasto--vuoto">
            Mandami una password nuova
          </button>
          <p className="mj-modulo__nota">
            Non hai ancora un Movijoy? <Link href="/privato">Attivalo</Link>.
          </p>
        </form>
      </section>
    </Cornice>
  );
}
