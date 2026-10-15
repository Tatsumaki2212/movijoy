import { NextResponse } from "next/server";
import { utenteCorrente } from "@/app/lib/db";
import { clientePerUtente, salvaContatto, salvaScheda } from "@/app/lib/clienti";
import { SITO } from "@/app/lib/sito";

/**
 * Le cinque domande della configurazione (/io/configura) finiscono qui
 * e diventano la scheda dei criteri. Si può rifare quando si vuole:
 * la scheda è della persona, non nostra.
 */

const MAX = { lavoro: 200, tono: 200, pubblico: 200, non_toccare: 1000, sito_web: 300, note: 1500 };

function pulisci(v: FormDataEntryValue | null, max: number): string | null {
  if (typeof v !== "string") return null;
  const t = v.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim();
  return t ? t.slice(0, max) : null;
}

export async function POST(req: Request) {
  const utente = await utenteCorrente();
  if (!utente) return NextResponse.redirect(`${SITO}/entra`, 303);
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) return NextResponse.redirect(`${SITO}/io`, 303);

  const m = await req.formData();

  /* Il telefono e i termini: chiesti a chi attiva un Movijoy per sé.
     Senza l'accettazione non si salva niente, e la pagina lo dice. */
  const telefono = (pulisci(m.get("telefono"), 40) ?? "").replace(/[^\d+()\-\s.]/g, "").trim() || null;
  const accetta = m.get("termini") === "si";
  if (!cliente.termini_accettati_il && !accetta) {
    return NextResponse.redirect(`${SITO}/io/configura?errore=termini`, 303);
  }

  const varietaGrezza = pulisci(m.get("varieta"), 20);
  const varieta = varietaGrezza === "american" ? "american" : "british";
  const nonToccare = (pulisci(m.get("non_toccare"), MAX.non_toccare) ?? "")
    .split(/[,;\n]/)
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 60);
  let sito = pulisci(m.get("sito_web"), MAX.sito_web);
  if (sito && !/^https?:\/\//i.test(sito)) sito = `https://${sito}`;
  if (sito && !/^https?:\/\/[^\s/]+\.[^\s/]{2,}/i.test(sito)) sito = null;

  const ok = await salvaScheda(cliente.id, {
    lavoro: pulisci(m.get("lavoro"), MAX.lavoro),
    varieta,
    tono: pulisci(m.get("tono"), MAX.tono),
    pubblico: pulisci(m.get("pubblico"), MAX.pubblico),
    non_toccare: nonToccare,
    sito_web: sito,
    note: pulisci(m.get("note"), MAX.note),
  });
  if (ok) await salvaContatto(cliente.id, { telefono, accettaTermini: accetta && !cliente.termini_accettati_il });
  return NextResponse.redirect(`${SITO}/io${ok ? "" : "/configura?errore=salvataggio"}`, 303);
}
