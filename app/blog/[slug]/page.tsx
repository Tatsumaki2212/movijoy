import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "../../movijoy.css";
import Cornice from "../../components/Cornice";
import { articoliBlog, articoloBlog } from "../../lib/holo";
import { SITO, NOME_SITO } from "../../lib/sito";

/**
 * Un articolo del blog di movijoy.it, arrivato da Holo.
 *
 * ⚠️ dangerouslySetInnerHTML CON IL FILTRO DAVANTI: l'HTML passa da
 * lib/sanifica-html.ts (elenco chiuso di tag e attributi) sia quando
 * viene salvato su chelivello sia quando viene letto qui. Non è una
 * scorciatoia: è l'unico posto del sito in cui entra HTML scritto da
 * fuori, e il filtro è il motivo per cui può entrare.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await articoloBlog(slug);
  if (!a) return { title: "Articolo non trovato", robots: { index: false } };
  const titolo = a.meta_titolo ?? a.titolo;
  const descrizione = a.meta_descrizione ?? a.estratto ?? undefined;
  return {
    title: titolo,
    description: descrizione,
    alternates: { canonical: `${SITO}/blog/${a.slug}` },
    openGraph: {
      type: "article",
      title: titolo,
      description: descrizione,
      url: `${SITO}/blog/${a.slug}`,
      publishedTime: a.pubblicato_il,
      modifiedTime: a.aggiornato_il,
      images: a.immagine_url ? [{ url: a.immagine_url, alt: a.immagine_alt ?? undefined }] : undefined,
    },
  };
}

const DATA = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });

export default async function Articolo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await articoloBlog(slug);
  if (!a) notFound();

  const altri = (await articoliBlog()).filter((x) => x.slug !== a.slug).slice(0, 4);

  const dati = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.titolo,
    description: a.meta_descrizione ?? a.estratto ?? undefined,
    inLanguage: "it-IT",
    datePublished: a.pubblicato_il,
    dateModified: a.aggiornato_il,
    image: a.immagine_url ?? undefined,
    author: { "@type": "Organization", name: NOME_SITO, url: SITO },
    publisher: { "@type": "Organization", name: NOME_SITO, url: SITO },
    mainEntityOfPage: `${SITO}/blog/${a.slug}`,
  };

  return (
    <Cornice>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(dati) }} />
      <article className="mj-foglio mj-sezione mj-blog">
        <p className="mj-blog__data">
          <Link href="/blog">Blog</Link> · <time dateTime={a.pubblicato_il}>{DATA.format(new Date(a.pubblicato_il))}</time>
        </p>
        <h1 className="mj-blog__titolo">{a.titolo}</h1>
        {a.estratto ? <p className="mj-blog__estratto">{a.estratto}</p> : null}
        {a.immagine_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- immagine esterna di Holo, dimensioni non note
          <img className="mj-blog__copertina" src={a.immagine_url} alt={a.immagine_alt ?? ""} loading="eager" />
        ) : null}

        <div className="mj-prosa" dangerouslySetInnerHTML={{ __html: a.html }} />

        {altri.length > 0 ? (
          <section className="mj-blog__altri">
            <h2 className="mj-sezione__titolo">Altri articoli</h2>
            <ul className="mj-blog__lista">
              {altri.map((x) => (
                <li key={x.slug}>
                  <Link href={`/blog/${x.slug}`}>{x.titolo}</Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <p className="mj-sezione__dice mj-blog__coda">
          Vuoi vedere che cosa sbagli tu? <Link href="/all-opera">Guarda Movijoy all&apos;opera</Link>.
        </p>
      </article>
    </Cornice>
  );
}
