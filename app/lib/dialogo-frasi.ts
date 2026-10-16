/**
 * Le frasi che Movijoy dice: il copione del dialogo e il grazie.
 *
 * Stanno in una libreria sola, usata dal dialogo (per scriverle) e dalla
 * rotta della voce (per pronunciarle): così il server può generare
 * l'audio SOLO delle frasi del sito, composte da lui, e nessuno può
 * mandargli un testo suo e consumare i crediti della voce.
 */

import { CONFIGURAZIONE_TESTO, MENSILE_TESTO, PIU_IVA } from "./prezzi-testo";

export type Scelta = { v: string; t: string };
export type Domanda =
  | { id: "nome"; tipo: "testo"; campo: string }
  | { id: "chi"; tipo: "scelta"; scelte: Scelta[] }
  | { id: "uso"; tipo: "scelta"; scelte: Scelta[] }
  | { id: "dettaglio"; tipo: "lungo"; campo: string }
  | { id: "email"; tipo: "email"; campo: string; campoPrivato: string };

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
  /* L'esempio nel campo segue la risposta «per chi»: a chi lo vuole per
     sé non si mostra un indirizzo aziendale (Lorenzo, 16 ottobre 2026). */
  { id: "email", tipo: "email", campo: "nome@azienda.it", campoPrivato: "nome@email.it" },
];

/** L'etichetta del campo, che per l'email dipende da «per chi». */
export function campoDi(d: Domanda, chi?: string): string {
  if (d.tipo === "scelta") return "";
  if (d.id === "email") return chi === "piattaforma" ? d.campo : d.campoPrivato;
  return d.campo;
}

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
      return dati.chi === "piattaforma"
        ? "Ultima cosa: dove ti contatta Che Livello!? La tua email."
        : "Ultima cosa: la tua email, per mandarti il link con cui attivare Movijoy.";
    /* ⚠️ NESSUNO SCRIVE A MANO A CHI LO VUOLE PER SÉ (Lorenzo, 16 ottobre
       2026): Movijoy privato si attiva dal sito, e il grazie lo dice. A chi
       lo vuole per una piattaforma, invece, una persona si fa viva. */
    case "grazie":
      return dati.chi === "piattaforma"
        ? `Grazie${nome ? `, ${nome}` : ""}. Le tue risposte sono arrivate: una persona di Che Livello! le legge e ti contatta${dati.email ? ` a ${dati.email}` : ""} per l'accordo, di solito in giornata.`
        : `Grazie${nome ? `, ${nome}` : ""}. Le tue risposte sono arrivate. Movijoy per te si attiva da solo: ti ho mandato${dati.email ? ` a ${dati.email}` : ""} il link per attivarlo, ${CONFIGURAZIONE_TESTO} di configurazione e poi ${MENSILE_TESTO} al mese, ${PIU_IVA}, senza vincolo.`;
  }
}

/* Quello che si PRONUNCIA può differire da quello che si scrive: la
   voce non legge bene «Che Livello!?», un indirizzo email, né «€». */
export function daDire(id: IdFrase, dati: { nome?: string; chi?: string; email?: string } = {}): string {
  const testo = frase(id, dati);
  if (id === "email") return testo.replace("Che Livello!?", "Che Livello?");
  if (id === "grazie")
    return testo
      .replace(/ a \S+@\S+?(?=[ ,.])/, "")
      .replace(/(\d+),(\d+) €/g, "$1 euro e $2")
      .replace(/\+ IVA 22%/g, "più IVA");
  return testo;
}
