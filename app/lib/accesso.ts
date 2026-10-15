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
 * ⚠️ IL LOGIN SI FA CON LA CHIAVE DI SERVIZIO, E POI SI SCRIVE LA
 * SESSIONE NEI COOKIE. Su Supabase Auth è acceso il captcha (Turnstile,
 * che chelivello mette nel suo modulo): una `signInWithPassword` con
 * la chiave anon da qui viene rifiutata «no captcha_token found». La
 * chiave di servizio non è soggetta al captcha, e il sito non ha (ancora)
 * un widget Turnstile suo. Il prezzo è che questa rotta diventa un
 * posto dove provare password senza captcha: per questo c'è il freno
 * dei tentativi (lib/tentativi.ts), e la risposta è la stessa per
 * «password sbagliata» e «indirizzo sconosciuto».
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
  const admin = servizio();
  const sb = await sessione();
  if (!admin || !sb) return null;
  const { data, error } = await admin.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
  if (error || !data.session || !data.user) return null;
  const { error: eCookie } = await sb.auth.setSession({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
  });
  if (eCookie) {
    console.error("accesso: sessione nei cookie —", eCookie.message);
    return null;
  }
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
