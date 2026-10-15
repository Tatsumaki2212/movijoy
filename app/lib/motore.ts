import { claude, MODELLO_CORREZIONE } from "./claude";
import { ELENCO_CHIAVI, elencoPerIlModello } from "./memoria-chiavi";
import { memoriaInProsa, schedaInProsa, type Annotazione, type Scheda, type Tratto } from "./clienti";

/**
 * Il motore di Movijoy privato: una chiamata, `correggi`.
 *
 * Riceve il testo di lavoro di una persona, la sua scheda dei criteri e
 * la sua memoria; restituisce il testo corretto, le annotazioni riga per
 * riga con la chiave dell'errore scelta da un elenco chiuso, una nota
 * sul tono, e quello che non sa.
 *
 * ⚠️ LA SCHEDA E LA MEMORIA VANNO NEL MESSAGGIO, NON NEL BLOCCO DI
 * SISTEMA. Il blocco di sistema è uguale per tutti e resta in cache fra
 * una chiamata e l'altra; metterci dentro una cosa diversa per ogni
 * cliente butterebbe via la cache a ogni correzione.
 *
 * ⚠️ «NON SO» È UNA RISPOSTA, NON UN FALLIMENTO. Un nome di prodotto, un
 * termine interno, una scelta che dipende da fatti che il modello non
 * ha: finiscono in `non_so` e diventano la domanda al maestro. È il
 * motivo per cui questo prodotto può costare quello che costa.
 */

const SISTEMA = `Sei Movijoy, l'assistente d'inglese privato di una persona italiana che scrive in inglese per lavoro. Lavori per Che Livello! S.r.l., Genova.

IL TUO COMPITO
Correggere il testo che ti manda — un'email, un documento, un messaggio — seguendo LA SUA SCHEDA DEI CRITERI (registro, varietà, tono, parole da non toccare) e la sua memoria (gli errori che gli tornano).

COME CORREGGI
- Tieni il significato e la voce di chi scrive. Non riscrivere quello che è già corretto: correggi, non riformuli. Se una frase è corretta ma suona come tradotta dall'italiano, correggila e di' perché.
- Rispetta la varietà (britannica o americana) e il tono della scheda. Se il testo ha un tono diverso da quello voluto — un'offerta che sembra una supplica, una richiesta che sembra un ordine — dillo nella nota sul tono, in una frase.
- Le PAROLE DA NON TOCCARE della scheda non si cambiano mai, nemmeno se sembrano errori.
- Ogni correzione è un'annotazione: la frase originale (copiata esatta), la versione corretta, il perché in italiano in una o due frasi, e la chiave dell'errore scelta dall'elenco. Se nessuna chiave calza, usa "altro".
- Spiega in italiano, dando del tu, preciso e breve. Niente complimenti a vuoto.
- Se qualcosa dipende da un fatto che non conosci (un nome, un termine della sua azienda, una scelta commerciale, il contesto della trattativa), non inventare: lascia il testo com'è su quel punto e metti la domanda in non_so.
- Se il testo non è in inglese, o non c'è niente da correggere, dillo: corretto = testo originale, annotazioni vuote, e una riga nella nota sul tono.

LE CHIAVI DEGLI ERRORI (scegli solo da qui, o "altro")
${elencoPerIlModello()}`;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["corretto", "annotazioni", "tono", "non_so"],
  properties: {
    corretto: { type: "string", description: "Il testo intero, corretto, pronto da usare." },
    annotazioni: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["originale", "corretto", "perche", "chiave"],
        properties: {
          originale: { type: "string" },
          corretto: { type: "string" },
          perche: { type: "string" },
          chiave: { type: "string", enum: [...ELENCO_CHIAVI, "altro"] },
        },
      },
    },
    tono: { type: "string", description: "Una frase sul tono rispetto alla scheda, o stringa vuota." },
    non_so: { type: "array", items: { type: "string" } },
  },
} as const;

export interface Correzione {
  corretto: string;
  annotazioni: Annotazione[];
  tono: string;
  non_so: string[];
  modello: string;
  token_in: number;
  token_out: number;
}

export async function correggi(dati: {
  testo: string;
  contesto?: string | null;
  scheda: Scheda | null;
  nome?: string | null;
  tratti: Tratto[];
}): Promise<Correzione | { errore: string; status: number }> {
  const memoria = memoriaInProsa(dati.tratti);
  const risposta = await claude.messages.create({
    model: MODELLO_CORREZIONE,
    max_tokens: 8000,
    thinking: { type: "adaptive" },
    output_config: { effort: "medium", format: { type: "json_schema", schema: SCHEMA } },
    system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content:
          `LA SUA SCHEDA DEI CRITERI\n${schedaInProsa(dati.scheda, dati.nome)}\n\n` +
          (memoria ? `${memoria}\n\n` : "") +
          `CONTESTO: ${dati.contesto?.trim() || "un testo di lavoro"}\n\nIL SUO TESTO:\n${dati.testo}`,
      },
    ],
  });

  if (risposta.stop_reason === "refusal") {
    return { errore: "Non posso correggere questo testo così com'è. Riscrivilo e riprova.", status: 422 };
  }
  const blocco = risposta.content.find((b) => b.type === "text");
  if (!blocco || blocco.type !== "text") return { errore: "Il modello non ha risposto.", status: 502 };

  let letto: { corretto: string; annotazioni: Annotazione[]; tono: string; non_so: string[] };
  try {
    letto = JSON.parse(blocco.text);
  } catch {
    return { errore: "La risposta del modello non si legge.", status: 502 };
  }
  return {
    corretto: letto.corretto,
    annotazioni: (letto.annotazioni ?? []).slice(0, 60),
    tono: letto.tono ?? "",
    non_so: (letto.non_so ?? []).slice(0, 10),
    modello: MODELLO_CORREZIONE,
    token_in: risposta.usage.input_tokens,
    token_out: risposta.usage.output_tokens,
  };
}
