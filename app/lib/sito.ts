/**
 * L'indirizzo canonico di movijoy.it.
 *
 * Deve essere l'indirizzo DEFINITIVO, quello che risponde 200 senza
 * rimbalzi: se su Vercel il dominio primario è l'apex, qui va l'apex;
 * se è il www, va il www. Dichiarare quello sbagliato fa puntare ogni
 * canonical a un indirizzo che poi rimbalza, e Google scansiona due
 * volte per arrivare dove poteva arrivare subito. È la stessa regola
 * scritta in chelivello (app/lib/sito.ts), imparata lì.
 */
export const SITO = (process.env.NEXT_PUBLIC_SITE_URL || "https://movijoy.it").replace(
  /\/$/,
  "",
);

export const NOME_SITO = "Movijoy";

/**
 * Il portale di Che Livello!, a cui questo sito è collegato.
 *
 * ⚠️ MOVIJOY È UN PRODOTTO A SÉ E QUESTO SITO NON VENDE IL REGISTRO.
 * Ma la società dietro è la stessa, e su chelivello.it stanno le cose
 * che non si duplicano: le pagine legali (informativa privacy, cookie
 * policy, termini), che nominano entrambi i domini, e — quando Movijoy
 * avrà un'offerta — gli account, perché il progetto Supabase è uno
 * solo. Decisione del 13 ottobre 2026: due progetti su Vercel, uno su
 * Supabase.
 */
export const CHELIVELLO = "https://www.chelivello.it";
export const NOME_CHELIVELLO = "Che Livello!";
