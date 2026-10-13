---
version: 1
slug: "app-page-tsx"
primary_target: "app/page.tsx"
related_targets: ["app/movijoy.css","app/api/richiesta/route.ts"]
---

# Pagina principale di movijoy.it — surface brief

Scope: `app/page.tsx` (rotta `/`), stile in `app/movijoy.css`, modulo in `app/api/richiesta/route.ts`. Visitor mode: **Persuade**.

Audience: due, stesso motore — chi integra Movijoy (aziende, scuole, siti) e la persona con il suo assistente privato. Nessuno dei due conosce Che Livello!, e la pagina non lo presuppone.

Job: capire che cos'è Movijoy e chiederlo. Action: il modulo di richiesta (`/api/richiesta` → tabella `richieste_movijoy` nel Supabase di chelivello), con il campo email già nel primo schermo e il modulo completo (nome, email, chi, messaggio) più sotto.

Proof: sei calchi veri dai moduli di grammatica, replicati in pagina come esempi; la faccia; i quattro motori che esistono; i limiti con lo stesso peso dei pregi.

Constraints: niente prezzo, niente «compra», niente rimando al registro o al test di chelivello; Che Livello! solo nel piede, come società; la memoria non si nomina; nessun cliente inventato, nessun «usato da»; ogni esempio di criteri etichettato come esempio; nessuna etichetta sopra un titolo.

Memorable moment: la correzione che si legge nel riflesso e poi si raddrizza, mentre la sfera parla e il piano si increspa.

Unresolved: l'offerta (i due posti `⚠️ OFFERTA`), Turnstile per il modulo, se Lorenzo compare come autore, un indirizzo @movijoy.it per le richieste.

## Direction contract

THESIS: Il primo schermo è un oggetto solo — la sfera sopra un piano nero lucido che la riflette, e la correzione che si legge nel riflesso. Rifiuta l'eroe diviso (testo a sinistra, prodotto a destra, fila di badge sotto) e il titolo centrato sopra tre schede uguali.

OWN-WORLD: nero profondo `#070b11` con il blu `#2c4667` in campiture larghe; rosso `#c8102e` come unico segnale (barrature, il tasto); giallo `#f6c453` come regolo (lineette, cartellini, fuoco); chiaro `#e9eff7`, tenue `#93a6bd`. Archivo 800 a scala enorme con `-0.045em`, Archivo Narrow maiuscolo spaziato per le etichette da strumento. Filetti da un pixel, nessuna scheda. Il piano riflettente in prospettiva è l'unico materiale «fisico» della pagina. Riconoscibile senza testo: una sfera con la croce di San Giorgio sopra un pavimento lucido.

STORY: chi arriva vede un errore vero corretto riga per riga, con il perché appuntato alla parola; capisce che Movijoy corregge con criteri precisi e dice quello che non sa fare; ci crede perché gli esempi sono veri e i limiti hanno lo stesso peso; scrive la sua email nella targa sul piano e, più sotto, dice chi è e che cosa gli serve.

FIRST VIEWPORT: barra con il marchio «Movijoy.» e tre etichette da strumento. Titolo «Scrivi. / Ti dico dove / perdi il punto.» a sinistra, Archivo 800 fino a 5.6rem, «perdi il punto» in rosso. La sfera (WebGL, ripiego SVG) al centro-destra, sopra l'orizzonte del piano. Il piano nero lucido in prospettiva occupa il terzo inferiore, con il riflesso capovolto e sfumato della sfera. Sotto il titolo: la frase sbagliata barrata in rosso, quella giusta con la parola corretta sottolineata in giallo, il perché appuntato con una lineetta gialla verticale e il cartellino «nasce da …». A destra, sul piano, la targa chiara con il campo email e il tasto rosso «Scrivimi»: l'azione primaria, funzionante. Motion grammar: un'entrata sola orchestrata (titolo, frase, targa salgono da uno stato già visibile); la correzione compare prima a specchio nel riflesso e si raddrizza; mentre il perché viene detto la bocca della sfera si muove e il piano si increspa; con `prefers-reduced-motion` tutto è fermo e dritto. Signature interaction: la correzione che si raddrizza dal riflesso.

FORM: Il piano riflettente — candidata 7 della lista ordinata, pescata come lead dal dado. Seed key **6d64c150** (scope surface, mode persuade). Schizzo scelto: `.impeccable/mocks/decision/assigned.html`. Code-led. Sfidante tenuto in tavola: il tabellone a palette (competitive); donazioni dagli scartati: il perché appuntato con una lineetta (tensegrità), il piano come superficie viva (ebru), il cartellino della frase italiana (bazar).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
