import { NextResponse } from "next/server";
import { daDire, type IdFrase } from "../../lib/dialogo-frasi";

/**
 * La voce vera di Movijoy: ElevenLabs, quando c'è la chiave.
 *
 * Il browser manda l'ID della frase e i dati che la completano (nome,
 * per chi, email); il testo lo compone IL SERVER dal copione in
 * lib/dialogo-frasi.ts. Nessun testo libero entra da fuori: è l'unico
 * modo di esporre una voce a pagamento senza che chiunque possa
 * consumarla con frasi sue.
 *
 * Senza chiave risponde 503 e il browser torna alla sintesi vocale di
 * sistema: la voce migliore è un'aggiunta, non una dipendenza.
 *
 * Variabili d'ambiente: ELEVENLABS_API_KEY, ELEVENLABS_VOICE_ID (la
 * voce scelta nella libreria di ElevenLabs; va bene una voce
 * multilingue, con il modello eleven_multilingual_v2).
 */

const IDS: IdFrase[] = ["nome", "chi", "uso", "dettaglio", "email", "grazie"];

export async function POST(req: Request) {
  const chiave = process.env.ELEVENLABS_API_KEY;
  const voce = process.env.ELEVENLABS_VOICE_ID;
  if (!chiave || !voce) {
    return NextResponse.json({ errore: "voce non configurata" }, { status: 503 });
  }

  let corpo: { id?: string; nome?: string; chi?: string; email?: string };
  try {
    corpo = (await req.json()) as typeof corpo;
  } catch {
    return NextResponse.json({ errore: "richiesta illeggibile" }, { status: 400 });
  }
  if (!IDS.includes(corpo.id as IdFrase)) {
    return NextResponse.json({ errore: "frase sconosciuta" }, { status: 400 });
  }

  const testo = daDire(corpo.id as IdFrase, {
    nome: corpo.nome,
    chi: corpo.chi === "piattaforma" ? "piattaforma" : "privato",
    email: String(corpo.email ?? "").slice(0, 200),
  });

  const r = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voce)}?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": chiave, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({
        text: testo,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.45, similarity_boost: 0.8, style: 0.2 },
      }),
    },
  );
  if (!r.ok) {
    console.error("voce:", r.status, (await r.text()).slice(0, 200));
    return NextResponse.json({ errore: "la voce non ha risposto" }, { status: 502 });
  }

  return new Response(r.body, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=0" },
  });
}
