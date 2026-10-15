import { NextResponse } from "next/server";
import { utenteCorrente } from "@/app/lib/db";
import { chiaveMancante } from "@/app/lib/claude";
import { clientePerUtente, ricordaTratti, salvaTesto, schedaDi, testiDelMese, trattiDi } from "@/app/lib/clienti";
import { correggi } from "@/app/lib/motore";

/**
 * La chat dell'area privata manda qui un testo; torna la correzione.
 *
 * Chi chiama deve essere collegato ed essere un cliente attivo. L'uso
 * ragionevole è cento testi al mese: oltre, un messaggio gentile e
 * niente chiamata al modello.
 */

const TESTI_AL_MESE = 100;
const MAX_CARATTERI = 12000;

export async function POST(req: Request) {
  const utente = await utenteCorrente();
  if (!utente) return NextResponse.json({ errore: "Devi entrare." }, { status: 401 });
  const cliente = await clientePerUtente(utente.id);
  if (!cliente) return NextResponse.json({ errore: "Questo indirizzo non ha un Movijoy." }, { status: 403 });
  if (cliente.stato !== "attivo") {
    return NextResponse.json({ errore: "Il tuo Movijoy è in pausa: controlla il pagamento dalla pagina del conto." }, { status: 402 });
  }
  if (chiaveMancante()) return NextResponse.json({ errore: "Il motore non è collegato." }, { status: 503 });

  let corpo: { testo?: unknown; contesto?: unknown };
  try {
    corpo = await req.json();
  } catch {
    return NextResponse.json({ errore: "Richiesta illeggibile." }, { status: 400 });
  }
  const testo = typeof corpo.testo === "string" ? corpo.testo.trim() : "";
  const contesto = typeof corpo.contesto === "string" ? corpo.contesto.trim().slice(0, 200) : null;
  if (!testo) return NextResponse.json({ errore: "Incolla un testo da correggere." }, { status: 400 });
  if (testo.length > MAX_CARATTERI) {
    return NextResponse.json({ errore: `Troppo lungo: al massimo ${MAX_CARATTERI} caratteri per volta.` }, { status: 413 });
  }

  const fatti = await testiDelMese(cliente.id);
  if (fatti >= TESTI_AL_MESE) {
    return NextResponse.json(
      { errore: `Hai usato i ${TESTI_AL_MESE} testi del mese: dal primo del mese prossimo si riparte. Se ti serve di più, scrivici.` },
      { status: 429 },
    );
  }

  const [scheda, tratti] = await Promise.all([schedaDi(cliente.id), trattiDi(cliente.id)]);

  let esito;
  try {
    esito = await correggi({ testo, contesto, scheda, nome: cliente.nome, tratti });
  } catch (e) {
    console.error("motore:", e instanceof Error ? e.message : e);
    return NextResponse.json({ errore: "Il motore non ha risposto. Riprova fra un momento." }, { status: 502 });
  }
  if ("errore" in esito) return NextResponse.json({ errore: esito.errore }, { status: esito.status });

  const id = await salvaTesto(cliente.id, {
    canale: "chat",
    contesto,
    originale: testo,
    corretto: esito.corretto,
    annotazioni: esito.annotazioni,
    tono_nota: esito.tono || null,
    non_so: esito.non_so,
    modello: esito.modello,
    token_in: esito.token_in,
    token_out: esito.token_out,
  });
  await ricordaTratti(cliente.id, esito.annotazioni);

  return NextResponse.json({
    id,
    corretto: esito.corretto,
    annotazioni: esito.annotazioni,
    tono: esito.tono,
    non_so: esito.non_so,
  });
}
