/**
 * Il filtro per l'HTML degli articoli di Holo. È la copia di
 * app/lib/sanifica-html.ts di chelivello: i due siti non condividono
 * codice, e la regola deve essere la stessa in tutti e due. Se cambia
 * uno, cambia anche l'altro.
 *
 * Tiene solo un elenco chiuso di tag e attributi; butta via script,
 * style, iframe e simili con il contenuto; href solo http(s), mailto,
 * relativo o ancora; src solo https; h1 diventa h2.
 */

const TAG_OK = new Set([
  "h2", "h3", "h4", "p", "ul", "ol", "li", "strong", "em", "b", "i", "u", "s",
  "a", "img", "blockquote", "br", "hr", "table", "thead", "tbody", "tr", "th",
  "td", "code", "pre", "figure", "figcaption", "sup", "sub", "span",
]);

const TAG_CON_CORPO_VIETATO = new Set([
  "script", "style", "iframe", "object", "embed", "svg", "math", "form",
  "textarea", "select", "noscript", "template", "video", "audio",
]);

const ATTR_OK: Record<string, Set<string>> = {
  a: new Set(["href", "title"]),
  img: new Set(["src", "alt", "width", "height"]),
  th: new Set(["colspan", "rowspan"]),
  td: new Set(["colspan", "rowspan"]),
};

const SENZA_CHIUSURA = new Set(["img", "br", "hr"]);

const TOKEN = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^<>]*)>|</g;
const ATTRIBUTO = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function valoreSicuro(attr: string, valore: string): string | null {
  const v = valore.trim();
  if (/[\u0000-\u001f]/.test(v)) return null;
  if (attr === "href" && !/^(https?:\/\/|mailto:|\/|#)/i.test(v)) return null;
  if (attr === "src" && !/^https:\/\//i.test(v)) return null;
  if (["width", "height", "colspan", "rowspan"].includes(attr) && !/^\d{1,4}$/.test(v)) return null;
  return v
    .replace(/&(?![a-zA-Z#][a-zA-Z0-9]*;)/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function attributiDi(nome: string, grezzi: string): string | null {
  const ammessi = ATTR_OK[nome];
  const pezzi: string[] = [];
  if (ammessi) {
    for (const m of grezzi.matchAll(ATTRIBUTO)) {
      const attr = m[1].toLowerCase();
      if (!ammessi.has(attr)) continue;
      const sicuro = valoreSicuro(attr, m[2] ?? m[3] ?? m[4] ?? "");
      if (sicuro !== null) pezzi.push(`${attr}="${sicuro}"`);
    }
  }
  if (nome === "img") {
    if (!pezzi.some((p) => p.startsWith("src="))) return null;
    pezzi.push('loading="lazy"', 'decoding="async"');
  }
  if (nome === "a" && pezzi.some((p) => p.startsWith('href="http'))) pezzi.push('rel="noopener"');
  return pezzi.length ? " " + pezzi.join(" ") : "";
}

export function sanificaHtml(html: string): string {
  let out = "";
  let ultimo = 0;
  let salta: string | null = null;

  for (const m of html.matchAll(TOKEN)) {
    const inizio = m.index ?? 0;
    if (!salta) out += html.slice(ultimo, inizio);
    ultimo = inizio + m[0].length;

    const tag = m[1];
    if (!tag) {
      if (m[0] === "<" && !salta) out += "&lt;";
      continue;
    }
    const chiude = m[0].startsWith("</");
    const grezzo = tag.toLowerCase();

    if (salta) {
      if (chiude && grezzo === salta) salta = null;
      continue;
    }
    if (TAG_CON_CORPO_VIETATO.has(grezzo)) {
      if (!chiude) salta = grezzo;
      continue;
    }
    const nome = grezzo === "h1" ? "h2" : grezzo;
    if (!TAG_OK.has(nome)) continue;
    if (chiude) {
      if (!SENZA_CHIUSURA.has(nome)) out += `</${nome}>`;
      continue;
    }
    const attributi = attributiDi(nome, m[2] ?? "");
    if (attributi === null) continue;
    out += `<${nome}${attributi}>`;
  }
  if (!salta) out += html.slice(ultimo);
  return out;
}
