import { cacheLife } from "next/cache";
import { sanificaHtml } from "./sanifica-html";

/**
 * Gli articoli di Holo per movijoy.it.
 *
 * Il webhook di Holo arriva su chelivello.it (app/api/holo in quel
 * repository), che salva nella tabella holo_articoli con `sito =
 * 'movijoy'` quando la marca è Movijoy. Qui si legge e basta, con la
 * chiave di servizio e due fetch, come fa api/richiesta: questo sito
 * non ha il client del database.
 *
 * ⚠️ CACHE A TEMPO, NON A EVENTO. Il webhook non può invalidare la
 * cache di un altro deploy, quindi le pagine si rinfrescano da sole
 * ogni ora («hours»): un articolo nuovo compare al massimo un'ora
 * dopo. Per il SEO è niente; per vederlo subito c'è il redeploy.
 *
 * L'HTML è già passato dal filtro quando è stato salvato; lo si ripassa
 * qui per lo stesso motivo per cui si chiude a chiave una porta già
 * chiusa: costa niente, e se un giorno la tabella venisse scritta da
 * un'altra strada, questa pagina non se ne accorgerebbe.
 */

export interface ArticoloBlog {
  slug: string;
  titolo: string;
  estratto: string | null;
  html: string;
  meta_titolo: string | null;
  meta_descrizione: string | null;
  immagine_url: string | null;
  immagine_alt: string | null;
  pubblicato_il: string;
  aggiornato_il: string;
}

const COLONNE =
  "slug,titolo,estratto,html,meta_titolo,meta_descrizione,immagine_url,immagine_alt,pubblicato_il,aggiornato_il";
const SLUG = /^[a-z0-9][a-z0-9-]{0,159}$/;

async function leggi(filtro: string): Promise<ArticoloBlog[]> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chiave) return [];
  try {
    const r = await fetch(
      `${url.replace(/\/$/, "")}/rest/v1/holo_articoli?select=${COLONNE}&sito=eq.movijoy&order=pubblicato_il.desc&limit=500${filtro}`,
      { headers: { apikey: chiave, Authorization: `Bearer ${chiave}` } },
    );
    if (!r.ok) {
      console.error("blog: Supabase", r.status);
      return [];
    }
    const righe = (await r.json()) as ArticoloBlog[];
    return righe.map((a) => ({ ...a, html: sanificaHtml(a.html ?? "") }));
  } catch (e) {
    console.error("blog:", e instanceof Error ? e.message : e);
    return [];
  }
}

export async function articoliBlog(): Promise<ArticoloBlog[]> {
  "use cache";
  cacheLife("hours");
  return leggi("");
}

export async function articoloBlog(slug: string): Promise<ArticoloBlog | null> {
  "use cache";
  cacheLife("hours");
  if (!SLUG.test(slug)) return null;
  const righe = await leggi(`&slug=eq.${encodeURIComponent(slug)}`);
  return righe[0] ?? null;
}
