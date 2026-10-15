import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../../movijoy.css";
import Cornice from "../../components/Cornice";
import { utenteCorrente } from "../../lib/db";
import { clientePerUtente, schedaDi } from "../../lib/clienti";
import { FormOrganizzazione } from "../Moduli";

/**
 * «Passa all'account aziendale»: per chi ha un Movijoy per sé e lo
 * vuole per la sua organizzazione.
 *
 * L'offerta per le organizzazioni è su accordo, non a listino: qui si
 * raccoglie la scheda dell'azienda, il conto diventa aziendale, e la
 * richiesta arriva a Che Livello! come tutte le altre (tabella
 * richieste_movijoy). Nel frattempo il motore resta suo, con la scheda
 * nuova.
 */

export const metadata: Metadata = {
  title: "Account aziendale",
  robots: { index: false, follow: false },
};

export default async function Azienda() {
  const utente = await utenteCorrente();
  if (!utente) redirect("/entra");
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) redirect("/io");
  if (cliente.password_da_cambiare) redirect("/io/password");
  if (cliente.tipo === "organizzazione") redirect("/io/configura");
  const s = await schedaDi(cliente.id);

  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-io">
        <p className="mj-blog__data">Account aziendale</p>
        <h1 className="mj-blog__titolo">Movijoy per la tua organizzazione.</h1>
        <p className="mj-blog__estratto">
          Lo stesso motore, con i criteri della casa invece che i tuoi: il tono dell&apos;azienda, il glossario
          condiviso, più persone, una fattura sola, e — quando serve — l&apos;integrazione sulla vostra piattaforma.
          Il prezzo si fa su accordo, non a listino: compila la scheda e una persona di Che Livello! ti richiama.
          Intanto Movijoy resta tuo, e usa subito la scheda nuova.
        </p>
        <ul className="mj-privato__lista">
          <li>Criteri per reparto: chi scrive ai clienti non suona come chi scrive ai fornitori.</li>
          <li>Il glossario dell&apos;azienda, uguale per tutti: prodotti, nomi, termini interni mai toccati.</li>
          <li>Un posto per ogni persona, e il rapporto del mese per chi coordina.</li>
          <li>Movijoy sul vostro sito o gestionale, con la vostra scheda, se vi serve.</li>
        </ul>

        <FormOrganizzazione cliente={cliente} s={s} prima={false} />

        <p className="mj-modulo__nota">
          <Link href="/io">Lascia stare, torna a Movijoy</Link>
        </p>
      </section>
    </Cornice>
  );
}
