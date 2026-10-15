import { servizio } from "./db";
import { tratto as chiaveTratto } from "./memoria-chiavi";

/**
 * I clienti di Movijoy privato: le righe delle tabelle mj_* (SQL 49 nel
 * repository di chelivello) e le poche operazioni che servono alle
 * pagine e alle rotte. Tutto col client di servizio, dopo che chi
 * chiama ha verificato l'utente.
 */

export type StatoCliente = "in_attesa" | "attivo" | "sospeso" | "chiuso";

export interface Cliente {
  id: string;
  utente: string | null;
  email: string;
  nome: string | null;
  telefono: string | null;
  termini_accettati_il: string | null;
  password_da_cambiare: boolean;
  stripe_cliente: string | null;
  stripe_abbonamento: string | null;
  stato: StatoCliente;
  piano: string;
  configurato_il: string | null;
  creato_il: string;
}

export interface Scheda {
  cliente: string;
  lavoro: string | null;
  varieta: "british" | "american" | null;
  tono: string | null;
  pubblico: string | null;
  non_toccare: string[];
  sito_web: string | null;
  note: string | null;
}

export interface Annotazione {
  originale: string;
  corretto: string;
  perche: string;
  chiave: string;
}

export interface Testo {
  id: string;
  canale: "chat" | "posta" | "api";
  contesto: string | null;
  originale: string;
  corretto: string;
  annotazioni: Annotazione[];
  tono_nota: string | null;
  non_so: string[];
  creato_il: string;
}

export interface Tratto {
  chiave: string;
  visto: number;
  esempi: string[];
  stato: "aperto" | "superato";
  ultimo_il: string;
}

const COLONNE_CLIENTE =
  "id, utente, email, nome, telefono, termini_accettati_il, password_da_cambiare, stripe_cliente, stripe_abbonamento, stato, piano, configurato_il, creato_il";

export async function clientePerUtente(utente: string): Promise<Cliente | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data } = await sb.from("mj_clienti").select(COLONNE_CLIENTE).eq("utente", utente).maybeSingle();
  return (data as Cliente | null) ?? null;
}

export async function clientePerEmail(email: string): Promise<Cliente | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data } = await sb
    .from("mj_clienti")
    .select(COLONNE_CLIENTE)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return (data as Cliente | null) ?? null;
}

export async function clientePerAbbonamento(stripeAbbonamento: string): Promise<Cliente | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data } = await sb
    .from("mj_clienti")
    .select(COLONNE_CLIENTE)
    .eq("stripe_abbonamento", stripeAbbonamento)
    .maybeSingle();
  return (data as Cliente | null) ?? null;
}

/**
 * L'account Supabase per un'email: quello che c'è (lo stesso database
 * di chelivello, cercato con la funzione utente_per_email della 44), o
 * uno nuovo, già confermato — l'indirizzo lo ha appena usato per
 * pagare, e il link per entrare arriva proprio lì.
 */
export async function utentePerEmail(email: string): Promise<{ id: string; nuovo: boolean } | null> {
  const sb = servizio();
  if (!sb) return null;
  const indirizzo = email.trim().toLowerCase();
  const { data: trovato } = await sb.rpc("utente_per_email", { p_email: indirizzo });
  if (trovato) return { id: trovato as string, nuovo: false };
  const { data, error } = await sb.auth.admin.createUser({
    email: indirizzo,
    email_confirm: true,
    user_metadata: { origine: "movijoy" },
  });
  if (error || !data.user) {
    console.error("clienti: creazione utente —", error?.message);
    return null;
  }
  return { id: data.user.id, nuovo: true };
}

/** Crea o aggiorna il cliente dopo un acquisto. Torna la riga, e se l'account Supabase è appena nato. */
export async function attivaCliente(dati: {
  email: string;
  nome?: string | null;
  stripeCliente: string | null;
  stripeAbbonamento: string | null;
}): Promise<{ cliente: Cliente; nuovo: boolean } | null> {
  const sb = servizio();
  if (!sb) return null;
  const email = dati.email.trim().toLowerCase();
  const u = await utentePerEmail(email);
  const utente = u?.id ?? null;
  const { data, error } = await sb
    .from("mj_clienti")
    .upsert(
      {
        email,
        utente,
        nome: dati.nome ?? null,
        stripe_cliente: dati.stripeCliente,
        stripe_abbonamento: dati.stripeAbbonamento,
        stato: "attivo",
        aggiornato_il: new Date().toISOString(),
      },
      { onConflict: "email" },
    )
    .select(COLONNE_CLIENTE)
    .single();
  if (error) {
    console.error("clienti: attivazione —", error.message);
    return null;
  }
  return { cliente: data as Cliente, nuovo: Boolean(u?.nuovo) };
}

/** Segna se la persona deve ancora scegliere una password sua. */
export async function segnaPassword(id: string, daCambiare: boolean): Promise<void> {
  const sb = servizio();
  if (!sb) return;
  const { error } = await sb
    .from("mj_clienti")
    .update({ password_da_cambiare: daCambiare, aggiornato_il: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("clienti: password —", error.message);
}

export async function cambiaStato(id: string, stato: StatoCliente): Promise<void> {
  const sb = servizio();
  if (!sb) return;
  const { error } = await sb
    .from("mj_clienti")
    .update({ stato, aggiornato_il: new Date().toISOString() })
    .eq("id", id);
  if (error) console.error("clienti: stato —", error.message);
}

/**
 * Il telefono (per la chiamata di configurazione) e, una volta sola,
 * l'accettazione dei termini e della privacy di Che Livello!, con data
 * e ora. L'accettazione non si toglie da qui: è un fatto, non un campo.
 */
export async function salvaContatto(
  id: string,
  dati: { telefono: string | null; accettaTermini: boolean },
): Promise<void> {
  const sb = servizio();
  if (!sb) return;
  const riga: Record<string, unknown> = { telefono: dati.telefono, aggiornato_il: new Date().toISOString() };
  if (dati.accettaTermini) riga.termini_accettati_il = new Date().toISOString();
  const { error } = await sb.from("mj_clienti").update(riga).eq("id", id);
  if (error) console.error("clienti: contatto —", error.message);
}

/* ── La scheda ─────────────────────────────────────────────────── */

export async function schedaDi(cliente: string): Promise<Scheda | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data } = await sb.from("mj_schede").select("*").eq("cliente", cliente).maybeSingle();
  return (data as Scheda | null) ?? null;
}

export async function salvaScheda(cliente: string, s: Omit<Scheda, "cliente">): Promise<boolean> {
  const sb = servizio();
  if (!sb) return false;
  const { error } = await sb
    .from("mj_schede")
    .upsert({ cliente, ...s, aggiornato_il: new Date().toISOString() }, { onConflict: "cliente" });
  if (error) {
    console.error("clienti: scheda —", error.message);
    return false;
  }
  await sb.from("mj_clienti").update({ configurato_il: new Date().toISOString() }).eq("id", cliente);
  return true;
}

/** La scheda resa in prosa per il modello: corta, e solo quello che c'è. */
export function schedaInProsa(s: Scheda | null, nome?: string | null): string {
  if (!s) return "Nessuna scheda ancora: correggi con un registro professionale neutro, inglese britannico.";
  const righe: string[] = [];
  if (nome) righe.push(`Si chiama ${nome}.`);
  if (s.lavoro) righe.push(`Lavoro: ${s.lavoro}.`);
  righe.push(`Varietà: inglese ${s.varieta === "american" ? "americano" : "britannico"}.`);
  if (s.tono) righe.push(`Tono che vuole tenere: ${s.tono}.`);
  if (s.pubblico) righe.push(`A chi scrive di solito: ${s.pubblico}.`);
  if (s.non_toccare.length) {
    righe.push(`PAROLE DA NON TOCCARE MAI (nomi, prodotti, termini interni): ${s.non_toccare.join(", ")}.`);
  }
  if (s.note) righe.push(`Note sue: ${s.note}`);
  return righe.join("\n");
}

/* ── I testi ───────────────────────────────────────────────────── */

export async function ultimiTesti(cliente: string, quanti = 20): Promise<Testo[]> {
  const sb = servizio();
  if (!sb) return [];
  const { data } = await sb
    .from("mj_testi")
    .select("id, canale, contesto, originale, corretto, annotazioni, tono_nota, non_so, creato_il")
    .eq("cliente", cliente)
    .order("creato_il", { ascending: false })
    .limit(quanti);
  return ((data ?? []) as Testo[]).reverse();
}

export async function testiDelMese(cliente: string): Promise<number> {
  const sb = servizio();
  if (!sb) return 0;
  const inizio = new Date();
  inizio.setDate(1);
  inizio.setHours(0, 0, 0, 0);
  const { count } = await sb
    .from("mj_testi")
    .select("id", { count: "exact", head: true })
    .eq("cliente", cliente)
    .gte("creato_il", inizio.toISOString());
  return count ?? 0;
}

export async function salvaTesto(
  cliente: string,
  t: Omit<Testo, "id" | "creato_il"> & { modello: string; token_in: number; token_out: number },
): Promise<string | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data, error } = await sb.from("mj_testi").insert({ cliente, ...t }).select("id").single();
  if (error) {
    console.error("clienti: testo —", error.message);
    return null;
  }
  /* Le cose che Movijoy non sa finiscono in coda: la domanda al maestro. */
  if (t.non_so.length) {
    await sb.from("mj_domande").insert(t.non_so.map((d) => ({ cliente, testo: data.id, domanda: d })));
  }
  return data.id as string;
}

/* ── La memoria ────────────────────────────────────────────────── */

export async function trattiDi(cliente: string): Promise<Tratto[]> {
  const sb = servizio();
  if (!sb) return [];
  const { data } = await sb
    .from("mj_tratti")
    .select("chiave, visto, esempi, stato, ultimo_il")
    .eq("cliente", cliente)
    .order("visto", { ascending: false });
  return (data ?? []) as Tratto[];
}

/** Dopo una correzione: ogni chiave vista sale di uno e tiene fino a tre frasi vere. */
export async function ricordaTratti(cliente: string, annotazioni: Annotazione[]): Promise<void> {
  const sb = servizio();
  if (!sb) return;
  const perChiave = new Map<string, string[]>();
  for (const a of annotazioni) {
    if (!chiaveTratto(a.chiave)) continue;
    const lista = perChiave.get(a.chiave) ?? [];
    if (a.originale && !lista.includes(a.originale)) lista.push(a.originale.slice(0, 200));
    perChiave.set(a.chiave, lista);
  }
  if (perChiave.size === 0) return;
  const esistenti = await trattiDi(cliente);
  const adesso = new Date().toISOString();
  const righe = [...perChiave.entries()].map(([chiave, nuovi]) => {
    const prima = esistenti.find((t) => t.chiave === chiave);
    const esempi = [...nuovi, ...(prima?.esempi ?? [])].slice(0, 3);
    return { cliente, chiave, visto: (prima?.visto ?? 0) + 1, esempi, stato: "aperto", ultimo_il: adesso };
  });
  const { error } = await sb.from("mj_tratti").upsert(righe, { onConflict: "cliente,chiave" });
  if (error) console.error("clienti: tratti —", error.message);
}

/** La memoria in poche righe per il modello: i tratti aperti più frequenti. */
export function memoriaInProsa(tratti: Tratto[], quanti = 6): string {
  const aperti = tratti.filter((t) => t.stato === "aperto").slice(0, quanti);
  if (aperti.length === 0) return "";
  const righe = ["I SUOI ERRORI RICORRENTI (dedotti dai suoi testi: puoi dire «mi pare», non darli per certi):"];
  for (const t of aperti) {
    const c = chiaveTratto(t.chiave);
    if (!c) continue;
    righe.push(`- ${c.titolo} [${t.visto === 1 ? "1 volta" : `${t.visto} volte`}]`);
    if (c.calco) righe.push(`  nasce da: ${c.calco}`);
    if (t.esempi[0]) righe.push(`  ha scritto: «${t.esempi[0]}»`);
  }
  return righe.join("\n");
}
