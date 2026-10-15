import { servizio } from "./db";
import { SITO } from "./sito";

/**
 * L'ingresso nell'area privata: un link per email, niente password.
 *
 * ⚠️ IL LINK LO COSTRUIAMO NOI con il gettone che Supabase genera lato
 * server (`generateLink` → `hashed_token`), e lo verifichiamo in
 * /auth/conferma con `verifyOtp`. Non si usa il link pronto di
 * Supabase: quello porta il gettone nel frammento dopo il cancelletto,
 * che al server non arriva mai (chelivello ci ha perso mesi), e passa
 * dal loro modello di email invece che dalla nostra lettera.
 *
 * Il gettone vale un'ora e una volta sola.
 */
export async function linkIngresso(email: string): Promise<string | null> {
  const sb = servizio();
  if (!sb) return null;
  const { data, error } = await sb.auth.admin.generateLink({
    type: "magiclink",
    email: email.trim().toLowerCase(),
  });
  const gettone = data?.properties?.hashed_token;
  if (error || !gettone) {
    console.error("accesso: link —", error?.message);
    return null;
  }
  return `${SITO}/auth/conferma?gettone=${encodeURIComponent(gettone)}`;
}
