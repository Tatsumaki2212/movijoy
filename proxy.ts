import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Il cancello dell'area privata: chi arriva su /io senza una sessione
 * va a /entra, con un redirect vero (307), prima che la pagina
 * cominci. La pagina lo rifà per conto suo — ma con `cacheComponents`
 * il suo redirect parte dentro il flusso, dopo il guscio: per un
 * browser va bene, per un crawler o un curl la risposta è un 200.
 * Qui si risponde prima che ci sia un flusso.
 *
 * Stesso schema del proxy di chelivello: il client di Supabase legge i
 * cookie della richiesta e, se rinnova la sessione, riscrive i cookie
 * nella risposta.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const risposta = NextResponse.next({ request });
  if (!url || !anon) return NextResponse.redirect(new URL("/entra?errore=link", request.url));

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(daScrivere) {
        daScrivere.forEach(({ name, value }) => request.cookies.set(name, value));
        daScrivere.forEach(({ name, value, options }) => risposta.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.redirect(new URL("/entra", request.url));
  return risposta;
}

export const config = {
  matcher: ["/io", "/io/:path*"],
};
