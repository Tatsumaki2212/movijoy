import type { CategoriaTratto } from "./memoria-tipi";

/**
 * L'elenco CHIUSO dei tratti che Movijoy può ricordare.
 *
 * ⚠️ È LA COSA DA CUI DIPENDE SE LA MEMORIA SERVE A QUALCOSA. Un tratto
 * vale solo per quante volte è tornato: se la stessa falla prende due
 * nomi — «present-perfect-sbagliato» oggi e «perfect-con-yesterday»
 * domani — il conteggio si spezza in due e l'errore più frequente di
 * quella persona sembra raro. Per questo le chiavi NON le scrive il
 * modello: le sceglie da qui, e lo schema JSON della risposta glielo
 * impone con un enum. Non può inventarne una nemmeno volendo.
 *
 * ⚠️ AGGIUNGERE UNA CHIAVE SI PUÒ, RINOMINARLA NO. Una chiave rinominata
 * azzera la storia di chi aveva accumulato quella — e la storia è
 * l'unica cosa che qui ha valore. Se una chiave si rivela sbagliata, se
 * ne aggiunge una nuova e la vecchia resta a invecchiare.
 *
 * ⚠️ FILE CLIENT-SAFE: importa solo tipi.
 */

export interface ChiaveTratto {
  chiave: string;
  categoria: CategoriaTratto;
  /** Come si dice allo studente, in italiano. */
  titolo: string;
  /** Da quale abitudine italiana nasce. Null quando non è un calco. */
  calco: string | null;
}

export const CHIAVI_TRATTI: ChiaveTratto[] = [
  /* ── Grammatica: i tempi ──────────────────────────────────── */
  {
    chiave: "perfect-con-momento-finito",
    categoria: "grammatica",
    titolo: "Present perfect dove ci vuole il past simple",
    calco: "«Ho visto Marco ieri» si costruisce come il present perfect, ma con un momento finito l'inglese vuole il past simple.",
  },
  {
    chiave: "presente-invece-di-perfect",
    categoria: "grammatica",
    titolo: "Presente dove ci vuole il present perfect",
    calco: "«Lavoro qui dal 2021»: l'italiano usa il presente, l'inglese il present perfect perché l'azione dura ancora.",
  },
  {
    chiave: "for-o-since",
    categoria: "grammatica",
    titolo: "For e since scambiati",
    calco: "«Da due ore» è una durata (for), «dal 2021» è un punto di partenza (since). In italiano è «da» in tutti e due i casi.",
  },
  {
    chiave: "verbi-di-stato-con-ing",
    categoria: "grammatica",
    titolo: "Forma in -ing su un verbo di stato",
    calco: "«Sto capendo», «sto volendo»: in italiano suonano bene, in inglese understand e want non prendono mai la -ing.",
  },
  {
    chiave: "futuro-dopo-congiunzione",
    categoria: "grammatica",
    titolo: "Futuro dopo when, if, as soon as",
    calco: "«Quando arriverò» è corretto in italiano. In inglese dopo le congiunzioni di tempo ci va il presente.",
  },
  {
    chiave: "past-perfect-mancante",
    categoria: "grammatica",
    titolo: "Manca il past perfect fra due fatti passati",
    calco: "Il trapassato italiano («era già uscito») in inglese è had + participio, e senza i due fatti sembrano simultanei.",
  },
  {
    chiave: "would-dopo-if",
    categoria: "grammatica",
    titolo: "Would dopo if",
    calco: "«Se avrei saputo» è sbagliato anche in italiano: in inglese dopo if non si mette mai would.",
  },
  {
    chiave: "passato-doppio-dopo-did",
    categoria: "grammatica",
    titolo: "Verbo al passato dopo did o didn't",
    calco: "«Didn't went»: il passato lo porta già l'ausiliare, e in italiano l'ausiliare non c'è, quindi la mano lo raddoppia.",
  },

  /* ── Grammatica: il resto ─────────────────────────────────── */
  {
    chiave: "terza-persona-senza-s",
    categoria: "grammatica",
    titolo: "Manca la -s della terza persona",
    calco: "In italiano il verbo cambia da sé e non serve ricordarsi una lettera in fondo.",
  },
  {
    chiave: "articolo-mancante",
    categoria: "grammatica",
    titolo: "Articolo mancante",
    calco: null,
  },
  {
    chiave: "articolo-di-troppo",
    categoria: "grammatica",
    titolo: "Articolo di troppo davanti a un astratto o a un plurale generico",
    calco: "«La vita è dura» → «Life is hard»: in inglese l'astratto generico non prende l'articolo.",
  },
  {
    chiave: "preposizione-sbagliata",
    categoria: "grammatica",
    titolo: "Preposizione sbagliata",
    calco: "Le preposizioni non si traducono: «depend on», «interested in», «good at» non seguono quelle italiane.",
  },
  {
    chiave: "plurale-di-incontabile",
    categoria: "grammatica",
    titolo: "Plurale su un nome che in inglese non ce l'ha",
    calco: "«Informations», «advices», «furnitures»: in italiano sono contabili, in inglese no.",
  },
  {
    chiave: "soggetto-mancante",
    categoria: "grammatica",
    titolo: "Frase senza soggetto",
    calco: "«È importante che…» → «It is important that…»: l'italiano lascia cadere il soggetto, l'inglese no.",
  },
  {
    chiave: "comparativo-sbagliato",
    categoria: "grammatica",
    titolo: "Comparativo o superlativo mal formato",
    calco: "«More easy» invece di «easier»: in italiano il comparativo è sempre analitico.",
  },
  {
    chiave: "gerundio-o-infinito",
    categoria: "grammatica",
    titolo: "Gerundio o infinito dopo il verbo sbagliato",
    calco: "Quali verbi reggono la -ing e quali il to non si deduce dall'italiano: va saputo verbo per verbo.",
  },
  {
    chiave: "passivo-sbagliato",
    categoria: "grammatica",
    titolo: "Passivo costruito male",
    calco: null,
  },
  {
    chiave: "ordine-delle-parole",
    categoria: "grammatica",
    titolo: "Ordine delle parole all'italiana",
    calco: "L'inglese tiene soggetto-verbo-oggetto e mette l'aggettivo prima del nome; l'italiano è molto più libero.",
  },
  {
    chiave: "concordanza",
    categoria: "grammatica",
    titolo: "Soggetto e verbo non concordano",
    calco: null,
  },

  /* ── Lessico ──────────────────────────────────────────────── */
  {
    chiave: "i-am-agree",
    categoria: "lessico",
    titolo: "«I am agree» invece di «I agree»",
    calco: "«Sono d'accordo» ha il verbo essere; in inglese agree È già il verbo.",
  },
  {
    chiave: "falso-amico",
    categoria: "lessico",
    titolo: "Falso amico",
    calco: "Eventually non è «eventualmente», actually non è «attualmente», sensible non è «sensibile», argument non è «argomento».",
  },
  {
    chiave: "collocazione-sbagliata",
    categoria: "lessico",
    titolo: "Parole che in inglese non vanno insieme",
    calco: "Make o do, say o tell: in italiano è «fare» e «dire» per tutto, e la scelta non si sente.",
  },
  {
    chiave: "parola-generica",
    categoria: "lessico",
    titolo: "Parole troppo generiche",
    calco: null,
  },
  {
    chiave: "ripetizione-lessicale",
    categoria: "lessico",
    titolo: "La stessa parola ripetuta",
    calco: null,
  },
  {
    chiave: "calco-dall-italiano",
    categoria: "lessico",
    titolo: "Frase tradotta parola per parola dall'italiano",
    calco: "La struttura è italiana e le parole sono inglesi: si capisce, ma non è quello che scriverebbe un madrelingua.",
  },

  /* ── Registro ─────────────────────────────────────────────── */
  {
    chiave: "registro-troppo-informale",
    categoria: "registro-linguistico",
    titolo: "Registro troppo informale per la traccia",
    calco: null,
  },
  {
    chiave: "registro-troppo-formale",
    categoria: "registro-linguistico",
    titolo: "Registro troppo formale o ingessato",
    calco: null,
  },

  /* ── Formato della prova ──────────────────────────────────── */
  {
    chiave: "fuori-conteggio-parole",
    categoria: "formato",
    titolo: "Fuori dal numero di parole richiesto",
    calco: null,
  },
  {
    chiave: "traccia-non-coperta",
    categoria: "formato",
    titolo: "Un punto della traccia non è stato trattato",
    calco: null,
  },
  {
    chiave: "paragrafi-assenti",
    categoria: "formato",
    titolo: "Testo senza paragrafi",
    calco: null,
  },
  {
    chiave: "apertura-o-chiusura-mancante",
    categoria: "formato",
    titolo: "Manca l'apertura o la chiusura che il genere richiede",
    calco: null,
  },

  /* ── Strategia ────────────────────────────────────────────── */
  {
    chiave: "connettivi-assenti",
    categoria: "strategia",
    titolo: "Frasi non collegate fra loro",
    calco: null,
  },
  {
    chiave: "esempi-assenti",
    categoria: "strategia",
    titolo: "Affermazioni senza esempi",
    calco: null,
  },
  {
    chiave: "traccia-ricopiata",
    categoria: "strategia",
    titolo: "Le parole della traccia ricopiate invece che riformulate",
    calco: null,
  },

  /* ── Ortografia ───────────────────────────────────────────── */
  {
    chiave: "ortografia",
    categoria: "ortografia",
    titolo: "Errori di ortografia",
    calco: "Spesso è l'italiano che si intromette: «comunication», «responsable», «apartment» con due p.",
  },
  {
    chiave: "punteggiatura",
    categoria: "ortografia",
    titolo: "Punteggiatura all'italiana",
    calco: "La virgola prima di «that» e le frasi lunghissime unite da virgole sono abitudini italiane.",
  },
];

/** Le sole chiavi, per l'enum dello schema della risposta. */
export const ELENCO_CHIAVI: string[] = CHIAVI_TRATTI.map((c) => c.chiave);

export function tratto(chiave: string): ChiaveTratto | null {
  return CHIAVI_TRATTI.find((c) => c.chiave === chiave) ?? null;
}

/**
 * L'elenco da mettere nel prompt, perché il modello sappia cosa
 * significa ogni chiave invece di indovinarlo dal nome.
 */
export function elencoPerIlModello(): string {
  return CHIAVI_TRATTI.map((c) => `- ${c.chiave}: ${c.titolo}`).join("\n");
}
