import type { Metadata } from "next";
import Link from "next/link";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import { articoliBlog } from "../lib/holo";
import { SITO } from "../lib/sito";

/**
 * L'indice del blog di movijoy.it: gli articoli di Holo (lib/holo.ts),
 * dentro la stessa cornice delle altre pagine.
 */

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Gli errori che gli italiani fanno in inglese, da quale frase nascono e come si chiudono: articoli di Movijoy.",
  alternates: { canonical: `${SITO}/blog` },
};

const DATA = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" });

export default async function Blog() {
  const tutti = await articoliBlog();

  return (
    <Cornice>
      <section className="mj-foglio mj-sezione mj-blog">
        <p className="mj-blog__data">Blog</p>
        <h1 className="mj-blog__titolo">Non sbagli a caso. Sbagli in italiano.</h1>
        <p className="mj-blog__estratto">
          Un errore per volta: da quale frase italiana nasce, come lo riconosci,
          come si chiude.
        </p>

        {tutti.length === 0 ? (
          <p className="mj-sezione__dice">
            I primi articoli arrivano a breve. Intanto puoi{" "}
            <Link href="/all-opera">vedere Movijoy all&apos;opera</Link>.
          </p>
        ) : (
          <ul className="mj-blog__lista">
            {tutti.map((a) => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`}>{a.titolo}</Link>
                <p>
                  <time dateTime={a.pubblicato_il}>{DATA.format(new Date(a.pubblicato_il))}</time>
                  {a.estratto ? ` · ${a.estratto}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Cornice>
  );
}
