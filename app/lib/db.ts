import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * I due client del database per Movijoy privato.
 *
 *  - `servizio()`: la chiave di servizio, solo sul server. Scavalca
 *    ogni regola per riga: è l'unico che scrive.
 *  - `sessione()`: la chiave anon con i cookie della persona collegata.
 *    Serve a sapere CHI è (`getUser`) e a far entrare con il link; non
 *    a leggere le tabelle mj_*, che si leggono col servizio dopo aver
 *    verificato l'utente.
 *
 * L'indirizzo del database vale con tutti e due i nomi (vedi
 * api/richiesta): SUPABASE_URL oppure NEXT_PUBLIC_SUPABASE_URL.
 */

export function urlDb(): string | null {
  return process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
}

export function servizio(): SupabaseClient | null {
  const url = urlDb();
  const chiave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chiave) return null;
  return createClient(url, chiave, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function sessione() {
  const url = urlDb();
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  const store = await cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(daScrivere) {
        try {
          daScrivere.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* I componenti server non possono scrivere cookie: lo fanno le
             rotte. Ignorare qui è corretto. */
        }
      },
    },
  });
}

/** L'utente collegato (dai cookie), o null. */
export async function utenteCorrente(): Promise<{ id: string; email: string } | null> {
  const sb = await sessione();
  if (!sb) return null;
  const { data } = await sb.auth.getUser();
  const u = data.user;
  return u?.email ? { id: u.id, email: u.email } : null;
}
