/**
 * Le frasi che Movijoy dice: il copione del dialogo e il grazie.
 *
 * Stanno in una libreria sola, usata dal dialogo (per scriverle) e dalla
 * rotta della voce (per pronunciarle): così il server può generare
 * l'audio SOLO delle frasi del sito, composte da lui, e nessuno può
 * mandargli un testo suo e consumare i crediti della voce.
 */

export type Scelta = { v: string; t: string };
export type Domanda =
  | { id: "nome"; tipo: "testo"; campo: string }
  | { id: "chi"; tipo: "scelta"; scelte: Scelta[] }
  | { id: "uso"; tipo: "scelta"; scelte: Scelta[] }
  | { id: "dettaglio"; tipo: "lungo"; campo: string }
  | { id: "email"; tipo: "email"; campo: string };

export const DOMANDE: Domanda[] = [
  { id: "nome", tipo: "testo", campo: "Il tuo nome" },
  {
    id: "chi",
    tipo: "scelta",
    scelte: [
      { v: "privato", t: "Per me" },
      { v: "piattaforma", t: "Per la mia piattaforma" },
    ],
  },
  {
    id: "uso",
    tipo: "scelta",
    scelte: [
      { v: "lavoro", t: "Email e documenti di lavoro" },
      { v: "esame", t: "Un esame: Cambridge, IELTS" },
      { v: "altro", t: "Altro" },
    ],
  },
  { id: "dettaglio", tipo: "lungo", campo: "Due righe bastano" },
  { id: "email", tipo: "email", campo: "nome@azienda.it" },
];

export type IdFrase = Domanda["id"] | "grazie";

/* Il nome entra nella frase pulito e corto: è l'unica parte che scrive
   l'utente, e finisce anche nel testo mandato alla voce. */
function nomePulito(nome?: string): string {
  return String(nome ?? "")
    .replace(/[^\p{L}\p{M}' \-]/gu, "")
    .trim()
    .slice(0, 40);
}

export function frase(id: IdFrase, dati: { nome?: string; chi?: string; email?: string } = {}): string {
  const nome = nomePulito(dati.nome);
  switch (id) {
    case "nome":
      return "Ciao, sono Movijoy. Prima di tutto: come ti chiami?";
    case "chi":
      return `Piacere, ${nome || "tu"}. Movijoy lo vuoi per te, o per la tua piattaforma — un'azienda, una scuola, un sito?`;
    case "uso":
      return "Che inglese scrivi di più?";
    case "dettaglio":
      return dati.chi === "piattaforma"
        ? "Raccontami la piattaforma in due righe: chi la usa, e che cosa dovrebbe fare Movijoy lì."
        : "Raccontami in due righe che cosa vorresti che Movijoy facesse per te.";
    case "email":
      return "Ultima cosa: dove ti scrive Che Livello!? La tua email.";
    case "grazie":
      return `Grazie${nome ? `, ${nome}` : ""}. Le tue risposte sono arrivate. Che Livello! le legge e ti scrive${dati.email ? ` a ${dati.email}` : ""}, di solito in giornata.`;
  }
}

/* Quello che si PRONUNCIA può differire da quello che si scrive: la
   voce non legge bene «Che Livello!?» né un indirizzo email. */
export function daDire(id: IdFrase, dati: { nome?: string; chi?: string; email?: string } = {}): string {
  const testo = frase(id, dati);
  if (id === "email") return "Ultima cosa: dove ti scrive Che Livello? La tua email.";
  if (id === "grazie") return testo.replace(/ a [^,]+@[^,]+,/, ",");
  return testo;
}
