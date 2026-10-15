import type { MetadataRoute } from "next";
import { SITO } from "./lib/sito";
import { articoliBlog } from "./lib/holo";

/**
 * Le pagine da far trovare: la casa, Movijoy all'opera, e gli articoli
 * del blog (lib/holo.ts). /parla e /grazie restano fuori: sono tappe
 * del dialogo, noindex, non pagine da cercare.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const oggi = new Date();
  const blog = (await articoliBlog()).map((a) => ({
    url: `${SITO}/blog/${a.slug}`,
    lastModified: new Date(a.aggiornato_il || a.pubblicato_il),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));
  return [
    { url: SITO, lastModified: oggi, changeFrequency: "monthly", priority: 1 },
    { url: `${SITO}/all-opera`, lastModified: oggi, changeFrequency: "monthly", priority: 0.8 },
    ...(blog.length ? [{ url: `${SITO}/blog`, lastModified: oggi, changeFrequency: "weekly" as const, priority: 0.6 }] : []),
    ...blog,
  ];
}
