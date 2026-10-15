/**
 * I tipi della memoria di Movijoy, in un file che non importa niente.
 *
 * ⚠️ STA SEPARATO DA memoria.ts PER LA SOLITA RAGIONE: quello parla col
 * database e passa da `next/headers`, quindi chi lo importa dal browser
 * fa cadere ogni pagina del sito con un 500. Qui ci sono solo i tipi e
 * le categorie, che servono anche a memoria-chiavi.ts — un file di
 * dati che deve restare leggibile da tutti e due i lati.
 */

export type CategoriaTratto =
  | "grammatica"
  | "lessico"
  | "formato"
  | "strategia"
  | "ortografia"
  | "registro-linguistico";

export type StatoTratto = "aperto" | "in-lavorazione" | "superato";

export interface Tratto {
  chiave: string;
  categoria: CategoriaTratto;
  titolo: string;
  calco: string | null;
  visto: number;
  primaVolta: string;
  ultimaVolta: string;
  esempi: string[];
  fonte: string | null;
  stato: StatoTratto;
}

export interface Fatto {
  chiave: string;
  valore: string;
  origine: "detto" | "dedotto" | "profilo";
  scadeIl: string | null;
}
