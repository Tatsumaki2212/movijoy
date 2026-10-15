import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "../../movijoy.css";
import Cornice from "../../components/Cornice";
import { utenteCorrente } from "../../lib/db";
import { clientePerUtente, schedaDi } from "../../lib/clienti";

/**
 * La configurazione: le cinque domande che diventano la scheda dei
 * criteri. Si rifà quando si vuole; i campi arrivano già pieni.
 *
 * Il sito web si chiede già adesso: la scansione del sito per copiare
 * tono e modo (idea di Lorenzo) arriva nella seconda fetta, e il dato
 * intanto resta nella scheda.
 */

export const metadata: Metadata = {
  title: "La tua scheda",
  robots: { index: false, follow: false },
};

export default async function Configura({ searchParams }: { searchParams: Promise<{ errore?: string }> }) {
  const utente = await utenteCorrente();
  if (!utente) redirect("/entra");
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) redirect("/io");
  const s = await schedaDi(cliente.id);
  const { errore } = await searchParams;
  const prima = !s;

  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-io">
        <p className="mj-blog__data">{prima ? "Cinque domande" : "La tua scheda"}</p>
        <h1 className="mj-blog__titolo">{prima ? "Dimmi come scrivi." : "Come scrivi, secondo te."}</h1>
        <p className="mj-blog__estratto">
          {prima
            ? "Queste risposte sono la tua scheda dei criteri: il metro con cui Movijoy ti corregge. Si cambiano quando vuoi."
            : "Cambia quello che vuoi: dalla prossima correzione Movijoy usa la scheda nuova."}
        </p>
        {errore === "salvataggio" && <p className="mj-modulo__stato">Non sono riuscito a salvare. Riprova.</p>}

        <form className="mj-modulo mj-io__scheda" method="post" action="/api/configura">
          <label className="mj-modulo__etichetta" htmlFor="lavoro">
            1. Che lavoro fai, e per chi scrivi in inglese?
          </label>
          <input id="lavoro" name="lavoro" className="mj-modulo__campo" maxLength={200} defaultValue={s?.lavoro ?? ""} placeholder="Export manager in un'azienda di macchine per il legno" />

          <p className="mj-modulo__etichetta">2. Inglese britannico o americano?</p>
          <div className="mj-scelte mj-scelte--radio">
            <label>
              <input type="radio" name="varieta" value="british" defaultChecked={!s || s.varieta !== "american"} /> British
            </label>
            <label>
              <input type="radio" name="varieta" value="american" defaultChecked={s?.varieta === "american"} /> American
            </label>
          </div>

          <label className="mj-modulo__etichetta" htmlFor="tono">
            3. Che tono vuoi tenere?
          </label>
          <input id="tono" name="tono" className="mj-modulo__campo" maxLength={200} defaultValue={s?.tono ?? ""} placeholder="Cordiale ma diretto; formale con i clienti nuovi" />

          <label className="mj-modulo__etichetta" htmlFor="pubblico">
            4. A chi scrivi di solito?
          </label>
          <input id="pubblico" name="pubblico" className="mj-modulo__campo" maxLength={200} defaultValue={s?.pubblico ?? ""} placeholder="Clienti in Germania e negli Stati Uniti, fornitori in Cina" />

          <label className="mj-modulo__etichetta" htmlFor="non_toccare">
            5. Le parole da non toccare mai: nomi, prodotti, termini interni (una per riga o separate da virgola)
          </label>
          <textarea id="non_toccare" name="non_toccare" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={1000} defaultValue={s?.non_toccare.join(", ") ?? ""} placeholder="MovePro 3000, il nostro reparto Ricambi, FOB Genoa" />

          <label className="mj-modulo__etichetta" htmlFor="sito_web">
            Il sito della tua azienda (facoltativo: presto Movijoy lo leggerà per copiare il vostro tono)
          </label>
          <input id="sito_web" name="sito_web" className="mj-modulo__campo" maxLength={300} defaultValue={s?.sito_web ?? ""} placeholder="www.tuaazienda.it" inputMode="url" />

          <label className="mj-modulo__etichetta" htmlFor="note">
            Altro che Movijoy deve sapere (facoltativo)
          </label>
          <textarea id="note" name="note" className="mj-modulo__campo mj-modulo__campo--lungo" rows={3} maxLength={1500} defaultValue={s?.note ?? ""} />

          <button type="submit" className="mj-tasto">
            {prima ? "Salva e comincia" : "Salva la scheda"}
          </button>
          {!prima && (
            <p className="mj-modulo__nota">
              <Link href="/io">Torna a Movijoy</Link>
            </p>
          )}
        </form>
      </section>
    </Cornice>
  );
}
