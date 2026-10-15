import { NextResponse } from "next/server";
import { utenteCorrente } from "@/app/lib/db";
import { cambiaTipo, clientePerUtente, salvaContatto, salvaScheda, segnalaAzienda } from "@/app/lib/clienti";
import { SITO } from "@/app/lib/sito";
import { telefonoNormale } from "@/app/lib/verifica";

/**
 * Le domande della configurazione (/io/configura, /io/azienda)
 * finiscono qui e diventano la scheda dei criteri. Due moduli, uno per
 * tipo di account (io/Moduli.tsx): il campo nascosto `tipo` dice quale
 * è arrivato. Si può rifare quando si vuole: la scheda è della persona.
 *
 * Il passaggio da «per me» a «organizzazione» succede qui, la prima
 * volta che arriva il modulo aziendale: il conto cambia tipo e la
 * richiesta parte a Che Livello! come tutte le altre, perché l'offerta
 * per le organizzazioni è su accordo.
 */

const MAX = { corto: 200, pubblico: 300, non_toccare: 1000, sito_web: 300, note: 1500, difficolta: 800 };

function pulisci(v: FormDataEntryValue | null, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  return t ? t.slice(0, max) : null;
}

function scelta<T extends string>(v: FormDataEntryValue | null, ammesse: readonly T[], base: T): T {
  return typeof v === "string" && (ammesse as readonly string[]).includes(v) ? (v as T) : base;
}

export async function POST(req: Request) {
  const utente = await utenteCorrente();
  if (!utente) return NextResponse.redirect(`${SITO}/entra`, 303);
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) return NextResponse.redirect(`${SITO}/io`, 303);

  const m = await req.formData();
  const tipo = scelta(m.get("tipo"), ["persona", "organizzazione"] as const, "persona");
  const indietro = tipo === "organizzazione" && cliente.tipo !== "organizzazione" ? "/io/azienda" : "/io/configura";

  /* Il telefono e i termini, in fondo a tutti e due i moduli. */
  const telefonoGrezzo = pulisci(m.get("telefono"), 40);
  const telefono = telefonoGrezzo ? telefonoNormale(telefonoGrezzo) : null;
  if (telefonoGrezzo && !telefono) return NextResponse.redirect(`${SITO}${indietro}?errore=telefono`, 303);
  const accetta = m.get("termini") === "si";
  if (!cliente.termini_accettati_il && !accetta) return NextResponse.redirect(`${SITO}${indietro}?errore=termini`, 303);

  const varieta = scelta(m.get("varieta"), ["british", "american"] as const, "british");
  const nonToccare = (pulisci(m.get("non_toccare"), MAX.non_toccare) ?? "")
    .split(/[,;\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 60);
  const note = pulisci(m.get("note"), MAX.note);

  let ok: boolean;
  if (tipo === "organizzazione") {
    const azienda = pulisci(m.get("azienda"), MAX.corto);
    if (!azienda) return NextResponse.redirect(`${SITO}${indietro}?errore=azienda`, 303);
    let sito = pulisci(m.get("sito_web"), MAX.sito_web);
    if (sito && !/^https?:\/\//i.test(sito)) sito = `https://${sito}`;
    if (sito && !/^https?:\/\/[^\s/]+\.[^\s/]{2,}/i.test(sito)) sito = null;
    const personeGrezze = Number(pulisci(m.get("persone"), 6) ?? "");
    const persone = Number.isInteger(personeGrezze) && personeGrezze > 0 && personeGrezze <= 10000 ? personeGrezze : null;
    ok = await salvaScheda(cliente.id, {
      lavoro: null,
      varieta,
      tono: pulisci(m.get("tono"), MAX.corto),
      pubblico: pulisci(m.get("pubblico"), MAX.pubblico),
      non_toccare: nonToccare,
      sito_web: sito,
      note,
      perche: null,
      scrivi: null,
      difficolta: null,
      azienda,
      settore: pulisci(m.get("settore"), MAX.corto),
      persone,
      reparti: null,
    });
    if (ok && cliente.tipo !== "organizzazione") {
      await cambiaTipo(cliente.id, "organizzazione");
      await segnalaAzienda(cliente, {
        azienda,
        settore: pulisci(m.get("settore"), MAX.corto),
        persone,
        sito,
        telefono: telefono ?? cliente.telefono,
      });
    }
  } else {
    ok = await salvaScheda(cliente.id, {
      lavoro: pulisci(m.get("lavoro"), MAX.corto),
      varieta,
      tono: scelta(m.get("tono"), ["cordiale", "formale", "diretto", "mio"] as const, "cordiale"),
      pubblico: null,
      non_toccare: nonToccare,
      sito_web: null,
      note,
      perche: scelta(m.get("perche"), ["lavoro", "studio", "viaggio", "piacere"] as const, "lavoro"),
      scrivi: scelta(m.get("scrivi"), ["email", "messaggi", "documenti", "social", "scuola"] as const, "email"),
      difficolta: pulisci(m.get("difficolta"), MAX.difficolta),
      azienda: null,
      settore: null,
      persone: null,
      reparti: null,
    });
  }

  if (ok) await salvaContatto(cliente.id, { telefono, accettaTermini: accetta && !cliente.termini_accettati_il });
  const dove = ok ? (tipo === "organizzazione" ? "/io?azienda=1" : "/io") : `${indietro}?errore=salvataggio`;
  return NextResponse.redirect(`${SITO}${dove}`, 303);
}
