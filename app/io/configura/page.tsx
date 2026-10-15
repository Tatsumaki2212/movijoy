import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../../movijoy.css";
import Cornice from "../../components/Cornice";
import { utenteCorrente } from "../../lib/db";
import { clientePerUtente, schedaDi } from "../../lib/clienti";
import { FormOrganizzazione, FormPersona } from "../Moduli";

/**
 * La configurazione: le domande che diventano la scheda dei criteri.
 * Diverse per chi ha un Movijoy per sé e per un'organizzazione
 * (Moduli.tsx). Si rifà quando si vuole; i campi arrivano già pieni.
 */

export const metadata: Metadata = {
  title: "La tua scheda",
  robots: { index: false, follow: false },
};

const ERRORI: Record<string, string> = {
  salvataggio: "Non sono riuscito a salvare. Riprova.",
  telefono: "Quel numero di telefono non sembra un numero: scrivilo con il prefisso, per esempio +39 333 1234567.",
  termini: "Per salvare la scheda serve l'accettazione dei termini e della privacy, qui in fondo.",
  azienda: "Serve il nome dell'organizzazione.",
};

export default async function Configura({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const utente = await utenteCorrente();
  if (!utente) redirect("/entra");
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) redirect("/io");
  if (cliente.password_da_cambiare) redirect("/io/password");
  const s = await schedaDi(cliente.id);
  const { errore } = await searchParams;
  const prima = !s;
  const organizzazione = cliente.tipo === "organizzazione";

  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-io">
        <p className="mj-blog__data">{organizzazione ? "La scheda dell'organizzazione" : prima ? "Cinque domande" : "La tua scheda"}</p>
        <h1 className="mj-blog__titolo">
          {organizzazione ? "Come scrive la vostra casa." : prima ? "Dimmi come scrivi tu." : "Come scrivi, secondo te."}
        </h1>
        <p className="mj-blog__estratto">
          {organizzazione
            ? "Queste risposte sono i criteri con cui Movijoy corregge chi scrive per voi. Si cambiano quando volete."
            : prima
              ? "Queste risposte sono la tua scheda: il metro con cui Movijoy ti corregge. Niente di aziendale, parliamo di te. Si cambiano quando vuoi."
              : "Cambia quello che vuoi: dalla prossima correzione Movijoy usa la scheda nuova."}
        </p>
        {errore && ERRORI[errore] && <p className="mj-modulo__stato">{ERRORI[errore]}</p>}

        {organizzazione ? (
          <FormOrganizzazione cliente={cliente} s={s} prima={prima} />
        ) : (
          <FormPersona cliente={cliente} s={s} prima={prima} />
        )}

        <p className="mj-modulo__nota">
          {!prima && <Link href="/io">Torna a Movijoy</Link>}
          {!prima && !organizzazione && " · "}
          {!organizzazione && <Link href="/io/azienda">Serve per la tua azienda? Passa all&apos;account aziendale</Link>}
        </p>
      </section>
    </Cornice>
  );
}
