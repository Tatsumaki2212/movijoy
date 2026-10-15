# movijoy.it

Il sito di **Movijoy**, l'intelligenza artificiale che corregge l'inglese
scritto sui criteri ufficiali Cambridge e IELTS. È un sito a parte, con
un repository a parte e un progetto Vercel a parte, nato il 13 ottobre
2026 da una decisione precisa: **movijoy.it vende Movijoy, non il
registro di Che Livello!**.

## Come sta in piedi

- **Next.js 16, App Router, TypeScript, senza Tailwind.** Lo stile del
  sito è tutto in `app/movijoy.css`, dentro `.mj`.
- **Nessun database, oggi.** La pagina è statica. Il giorno in cui
  Movijoy avrà un'offerta e servirà un account, il progetto Supabase da
  usare è **quello di chelivello**, non uno nuovo: un solo bacino di
  utenti, un solo sistema di consensi, cancellazione e disdetta, una
  sola informativa. Stesso account Stripe, prodotto nuovo.
- **Le pagine legali stanno su chelivello.it** e nominano anche questo
  dominio: una copia sola, apposta, e il piede ci rimanda. Il banner
  dei cookie invece è per dominio — qui non c'è perché non c'è nessun
  pixel: l'unico strumento di misura è il contatore di Vercel, che non
  usa cookie.

## Che cosa viene da chelivello, e va tenuto allineato a mano

| File | Da dove | Perché è una copia |
| --- | --- | --- |
| `app/movijoy.css` | `piattaforma-inglese/app/movijoy.css` | la stessa interfaccia di `chelivello.it/movijoy` |
| `app/components/Sfera.tsx`, `Faccia.tsx` | `piattaforma-inglese/app/movijoy/Sfera.tsx`, `app/components/Faccia.tsx` | la faccia del prodotto |
| `app/caratteri/*.woff2` | `piattaforma-inglese/app/caratteri/` | Archivo e Archivo Narrow, solo latino |
| `app/lib/societa.ts` | `piattaforma-inglese/app/lib/societa.ts` | i dati della società — **il REA manca ancora, di là e di qua** |
| `app/lib/titolare.ts` | `piattaforma-inglese/app/lib/titolare.ts` | chi incassa finché Stripe non passa alla società |
| i sei calchi in `app/page.tsx` | `piattaforma-inglese/app/lib/grammatica/` | copiati testualmente, sei diversi da quelli del portale |

Quando uno di questi cambia di là, cambia anche qui, lo stesso giorno.

## L'offerta non c'è ancora

In `app/page.tsx` ci sono due posti segnati con `⚠️ OFFERTA`: il blocco
dei tasti nell'apertura e la sezione di chiusura. Sono vuoti. Si
riempiono quando l'offerta di Movijoy è definita — con quella, non con
un rimando al registro «nel frattempo». Lo stesso vale per `offers` nei
dati strutturati.

## Lanciarlo

```bash
npm install
npm run dev
```

Su Vercel: un progetto nuovo collegato a questo repository, con i
domini `movijoy.it` e `www.movijoy.it` attaccati a lui (Vercel non
permette lo stesso dominio su due progetti: se stava sul progetto di
chelivello, va tolto da lì). Il primario è il **www**: `movijoy.it`
rimbalza su `www.movijoy.it`, e il canonical nel codice dice il www.

Variabili d'ambiente del progetto Vercel:

- `NEXT_PUBLIC_SITE_URL` — facoltativa, l'indirizzo canonico se diverso
  da `https://www.movijoy.it`. Deve essere quello definitivo, che
  risponde 200 senza rimbalzi.
- `SUPABASE_URL (vale anche NEXT_PUBLIC_SUPABASE_URL)`, `SUPABASE_SERVICE_ROLE_KEY` — **il progetto Supabase di
  chelivello**, non uno nuovo. Il modulo della richiesta scrive nella
  tabella `richieste_movijoy`, creata da `supabase/47-richieste-movijoy.sql`
  nel repository di chelivello: quella migrazione va lanciata prima.
  Senza queste due variabili il modulo risponde 503 e dice di scrivere
  per posta.
- `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` — facoltative: **la voce
  vera di Movijoy** (`app/api/voce/route.ts`). Senza, il dialogo usa la
  sintesi vocale del browser. La rotta pronuncia solo le frasi del
  copione in `app/lib/dialogo-frasi.ts`: nessun testo libero da fuori.
- `GOOGLE_SITE_VERIFICATION` — facoltativa: il codice che Google Search
  Console dà per il metodo «tag HTML». Messo, il tag compare in ogni
  pagina; poi in Search Console si clicca *Verifica* e si invia la mappa
  `https://www.movijoy.it/sitemap.xml`.
- `RESEND_API_KEY`, `RICHIESTE_A` — facoltative: l'avviso per posta a
  chi risponde (l'indirizzo in `RICHIESTE_A`), mandato dopo il
  salvataggio. Il mittente è `richieste@movijoy.it`: il dominio va
  verificato su Resend, altrimenti l'avviso non parte e la richiesta
  resta comunque nel database.

## Il percorso: vederlo, poi parlarci

L'azione della casa è un tasto, «Vedi Movijoy all'opera»:

1. `/all-opera` — due scene animate in HTML (`app/components/DemoOpera.tsx`):
   la mail corretta riga per riga con il perché, e Movijoy sul sito di
   un'azienda d'esempio che risponde con i criteri di quella.
2. `/parla` — il dialogo (`app/components/Dialogo.tsx`): cinque domande
   di profilazione a copione, scritte lettera per lettera mentre la sfera
   muove la bocca; le risposte partono in una richiesta sola verso
   `app/api/richiesta/route.ts`, cioè nella tabella `richieste_movijoy`.
3. `/grazie` — Movijoy ringrazia per nome (nome ed email passano in
   sessionStorage, mai nell'indirizzo).

Contro i robot, nella rotta: un campo trappola e un tempo minimo dal
caricamento. Il punto in cui aggiungere Turnstile, se un giorno serve,
è segnato lì.

## La pagina principale, e come è nata

Composizione scelta da Lorenzo il 13 ottobre 2026 sulla pagina di scelta
di Impeccable: «Il piano riflettente». Il contratto di direzione sta in
`.impeccable/surfaces/app-page-tsx.md`; la verità sul prodotto in
`PRODUCT.md`. Le catture e gli schizzi in `.impeccable/review/` e
`.impeccable/mocks/` non si committano.

Controlli prima di un deploy: `npx tsc --noEmit`, `npm run lint`,
`npm run build`.

## Movijoy privato (dal 15 ottobre 2026)

Il privato compra da solo: `/privato` → `POST /api/compra` (Stripe Checkout: configurazione una tantum +
manutenzione mensile) → `/attivato`. Il webhook `POST /api/stripe` crea il cliente (tabelle `mj_*`,
SQL 49 nel repository di chelivello) e manda la lettera di benvenuto con nome utente (l'email) e password temporanea se l'account è nuovo
(chi ha già un account Che Livello! entra con la sua). `/entra` è email + password (`POST /api/entra`);
`POST /api/password-dimenticata` manda una password nuova; `/io/password` → `POST /api/password` la cambia,
obbligatorio dopo una temporanea (`mj_clienti.password_da_cambiare`, SQL 51). `/io` è l'area privata:
le cinque domande (`/io/configura` → `POST /api/configura`) diventano la scheda dei criteri; la chat
manda a `POST /api/motore`, che corregge con la scheda e la memoria del cliente (`lib/motore.ts`) e
aggiorna i tratti. `POST /api/portale` apre il portale di Stripe; `POST /api/esci` esce.

Variabili in più: `SUPABASE_ANON_KEY` (per la sessione), `ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`,
`STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_MJ_CONFIGURAZIONE`, `STRIPE_PRICE_MJ_MENSILE`, `MITTENTE_EMAIL`
(un mittente verificato su Resend), `RESEND_API_KEY`.

Il login (`POST /api/entra`) usa la chiave di servizio, perché Supabase Auth ha il captcha acceso e il sito
non ha un widget Turnstile suo; la sessione viene poi scritta nei cookie. Per questo c'è il freno dei
tentativi (`lib/tentativi.ts`, tabella `mj_tentativi`, SQL 52): otto in un quarto d'ora per IP+email.
