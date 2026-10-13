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
chelivello, va tolto da lì). Una sola variabile, facoltativa:

- `NEXT_PUBLIC_SITE_URL` — l'indirizzo canonico, se diverso da
  `https://movijoy.it`. Deve essere quello definitivo, che risponde
  200 senza rimbalzi.

Controlli prima di un deploy: `npx tsc --noEmit`, `npm run lint`,
`npm run build`.
