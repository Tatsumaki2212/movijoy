import { randomInt } from "node:crypto";
import { servizio, sessione } from "./db";

/**
 * L'ingresso nell'area privata: email e password.
 *
 * Appena il cliente nasce (webhook di Stripe) gli si assegna una
 * password temporanea e gliela si manda per email; al primo accesso
 * deve cambiarla (/io/password). Chi aveva già un account Che Livello!
 * con la stessa email entra con la password che ha: l'account Supabase
 * è lo stesso per i due siti, e sovrascrivergli la password da qui
 * gliela cambierebbe anche di là senza che l'abbia chiesto.
 *
 * ⚠️ LA PASSWORD TEMPORANEA NON SI SALVA DA NESSUNA PARTE in chiaro:
 * va nella lettera e nel database di Supabase, già cifrata. Se la
 * lettera si perde, se ne genera un'altra.
 */

/* Senza 0/O, 1/l/I: si legge da una mail e si ricopia senza dubbi. */
const ALFABETO = "abcdefghjkmnpqrstuvwxyz23456789";

export function passwordTemporanea(): string {
  const gruppo = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join("");
  return `${gruppo()}-${gruppo()}-${gruppo()}`;
}

/** Assegna una password nuova all'account: torna la password in chiaro, da mandare per email. */
export async function assegnaPasswordTemporanea(utente: string): Promise<string | null> {
  const sb = servizio();
  if (!sb) return null;
  const password = passwordTemporanea();
  const { error } = await sb.auth.admin.updateUserById(utente, { password });
  if (error) {
    console.error("accesso: password temporanea —", error.message);
    return null;
  }
  return password;
}

/** Entra con email e password: scrive i cookie della sessione. Torna l'id utente o null. */
export async function entraConPassword(email: string, password: string): Promise<string | null> {
  const sb = await sessione();
  if (!sb) return null;
  const { data, error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data.user) return null;
  return data.user.id;
}

/** Cambia la password di chi è collegato. */
export async function cambiaPassword(password: string): Promise<boolean> {
  const sb = await sessione();
  if (!sb) return false;
  const { error } = await sb.auth.updateUser({ password });
  if (error) console.error("accesso: cambio password —", error.message);
  return !error;
}
