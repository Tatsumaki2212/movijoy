# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Due pubblici, con **lo stesso motore** (decisione di Lorenzo, 13 ottobre
2026: «tutti e due, stesso motore»):

1. **Chi integra Movijoy nella propria piattaforma o nel proprio sito.**
   Aziende, scuole, siti: un'organizzazione che vuole un assistente di
   inglese *con criteri di risposta suoi* — il suo inglese, i suoi casi,
   il suo tono — a disposizione dei propri utenti. Chi decide
   l'integrazione non è chi scrive: è un titolare, un responsabile, un
   insegnante che compra per altri.
2. **La persona che vuole il proprio assistente privato di inglese**,
   configurato su di lei e sui suoi obiettivi.

Tutti e due sono italiani; l'interfaccia è in italiano, l'inglese è la
materia. Nessuno dei due arriva su movijoy.it sapendo che cosa sia Che
Livello!, e la pagina non deve presupporlo.

Quale dei due va messo per primo sulla pagina è una decisione di
superficie, non di prodotto: la prende il lavoro di progettazione
(new-work), non questo documento.

## Product Purpose

Movijoy è **un motore di intelligenza artificiale dedicato all'inglese,
con criteri di risposta precisi e unici per ogni cliente**: un
assistente IA privato, implementabile su piattaforme e siti, che Che
Livello! S.r.l. vuole commercializzare come prodotto a sé.

Successo: un cliente — organizzazione o persona — ha il *suo* Movijoy,
che risponde e corregge secondo i criteri definiti per lui, e lo usa.

## Positioning

- **Criteri per cliente, non un chatbot generico.** La cosa che un
  prodotto vicino non copia a buon mercato è che le regole di risposta
  vengono definite per il singolo cliente — e che sotto ci sono già i
  criteri ufficiali: il motore corregge sui quattro criteri Cambridge
  del Writing e sulle nove bande IELTS, riga per riga, con il perché
  accanto a ogni riga.
- **Conosce gli errori che fa un italiano** in inglese — i calchi — e
  li spiega a partire dalla frase italiana da cui nascono. I moduli di
  grammatica che li catalogano esistono (nel repository di chelivello,
  `app/lib/grammatica/`).
- **Dice i limiti ad alta voce.** Nella sua categoria tutti promettono
  di capirti; Movijoy scrive in pagina che cosa non sa fare.

Concorrenti noti, da sapere e non da nominare in pagina: Cambridge
Write & Improve corregge lo scritto **gratis**; Grammarly e LanguageTool
sono correttori generici. Nessuno dei tre definisce criteri per cliente
né li applica alle scale d'esame.

## Operating Context

- **Il motore esiste e gira dentro il registro di Che Livello!**
  (repository `piattaforma-inglese`): quattro motori — correzione dello
  scritto, esercizi generati sugli errori, valutazione del parlato sul
  trascritto, piano della settimana — più l'assistente «sportello» che
  risponde ai visitatori di chelivello.it. Tutti usano l'API di
  Anthropic.
- **Come si compra e si integra oggi: per contatto diretto.** Il cliente
  scrive o chiama; Lorenzo e Gaspare Vicari definiscono i criteri,
  configurano il motore e lo mettono sulla sua piattaforma o nel suo
  sito. Un accordo per cliente. **Non esiste** una chiave API, uno
  script da incollare, un pannello self-service o un prodotto da
  comprare da soli (verificato nel codice il 13 ottobre 2026).
- Infrastruttura: questo sito è un progetto Next.js suo su Vercel;
  **non ha un database**. Quando ne servirà uno (account, testi,
  consensi), il progetto Supabase da usare è quello di chelivello, non
  uno nuovo (decisione del 13 ottobre 2026). Stesso account Stripe.
- Le pagine legali (informativa privacy, cookie policy, termini) stanno
  su chelivello.it e nominano anche questo dominio: una copia sola.
- Chi scrive sulla piattaforma di un cliente lo fa dalla piattaforma del
  cliente: il contesto d'uso del motore è quello, non movijoy.it.
  movijoy.it è dove si viene a capire che cosa sia e a chiederlo.

## Capabilities and Constraints

**Confermate (esistono e girano):**

- Correzione dello scritto sui criteri ufficiali Cambridge e IELTS, in
  circa venti secondi, con il motivo accanto a ogni riga segnata.
- Esercizi generati sugli errori di chi scrive, nel formato della prova.
- Valutazione del parlato sul trascritto (lessico, grammatica,
  organizzazione).
- Piano della settimana costruito sui risultati reali.
- La faccia: la sfera con la croce di San Giorgio, animata, che parla
  (`app/components/Sfera.tsx`, `Faccia.tsx`).

**Limiti che il prodotto non deve mai nascondere:**

- Non valuta la pronuncia: il parlato arriva come trascrizione.
- Non simula la parte in coppia dello Speaking Cambridge.
- Non indovina l'intenzione: corregge la frase scritta.
- Non rilascia certificati: dà le bande con i criteri alla mano.
- **La memoria** — il catalogo degli errori di una persona che cresce
  nel tempo — ha le tabelle scritte ma **non è collegata ai motori**. Non
  va presentata come cosa che fa. (Nel repository di chelivello il
  codice di `/api/correggi` manda la memoria nel prompt a ogni
  correzione mentre la pagina del portale dice il contrario: finché la
  contraddizione non è sciolta, su movijoy.it la memoria non si nomina.)
- I criteri per cliente vengono definiti e configurati **a mano** da
  Lorenzo e Gaspare: non c'è un'interfaccia con cui il cliente li
  imposta da solo.

**Decisioni aperte (non inventare):**

- **L'offerta**: che cosa comprende, come è confezionata, il prezzo.
  Lorenzo la dirà. Nella pagina i due posti in cui andrà sono segnati
  «⚠️ OFFERTA» (`app/page.tsx`).
- Il meccanismo tecnico di integrazione (oggi: fatto a mano, per
  cliente). Nessuna promessa di API, plugin o widget.
- Se e come Lorenzo compare come autore del metodo su movijoy.it (su
  chelivello.it compare; qui non è stato deciso).
- Il canale di contatto da mettere in pagina (email `principale@chelivello.it`
  esiste; un numero o un modulo dedicato a Movijoy non sono stati
  decisi).

## Brand Commitments

- **Nome: Movijoy**, dato da Lorenzo il 7 agosto 2026. Si scrive così,
  senza articolo. Definizione data da Lorenzo il 13 ottobre 2026:
  «un'intelligenza artificiale dedicata all'inglese con criteri di
  risposta ben precisi e unici per ogni cliente», «un motore di IA
  personale di inglese implementabile su varie piattaforme o sui siti
  web», «assistente IA **privato**».
- **La faccia è il personaggio, non un'illustrazione**: la sfera con la
  croce di San Giorgio (bandiera dell'Inghilterra), con occhi e bocca
  che si muove quando parla. Stabilita il 5 agosto 2026, approvata da
  Lorenzo.
- **Che Livello! compare solo nel piede, come società** («Solo nel
  piede, come società», 13 ottobre 2026): è la S.r.l. che sta dietro,
  per l'art. 2250 c.c., e un collegamento. Nessun «di Che Livello!» nel
  titolo o nel testo; Movijoy si presenta da solo.
- **La società:** «Che Livello!» S.r.l., Genova, costituita il 6 ottobre
  2026 (`app/lib/societa.ts`); finché Stripe resta intestato alla
  partita IVA individuale di Lorenzo, in fondo si dice chi incassa
  (`app/lib/titolare.ts`).
- Voce (ereditata dal materiale di Che Livello! e confermata dalla
  pagina di Movijoy approvata il 5 ottobre 2026): diretta, in seconda
  persona, nessuna promessa di risultato, i limiti scritti con lo stesso
  peso dei pregi, nessun «powered by AI», nessun punto esclamativo
  commerciale.
- Lingua dell'interfaccia: italiano. Gli esempi di inglese restano in
  inglese.

## Evidence on Hand

**Reale:**

- I quattro motori e l'assistente, in esercizio su chelivello.it da
  settimane (repository `piattaforma-inglese`).
- I calchi degli italiani, con sbagliato/giusto/perché, nei moduli di
  grammatica (`piattaforma-inglese/app/lib/grammatica/`): sei sono già
  copiati testualmente in `app/page.tsx`, diversi dai sei usati sul
  portale.
- Lorenzo Antonio Moccia ha il **C2 Proficiency** (Cambridge), il
  livello più alto della scala: verificabile. Se usarlo su movijoy.it è
  una decisione aperta (vedi sopra).
- La faccia e la sfera, già costruite e animate.

**Assenze che il lavoro futuro non deve fabbricare:**

- **Nessun cliente di Movijoy, oggi.** Nessuna integrazione esistente
  fuori dal sito di Che Livello!. Nessun logo, nessun «usato da»,
  nessuna testimonianza, nessun numero di utenti, nessun caso.
- Nessun prezzo, nessun piano, nessuna API, nessun pannello.
- La sponsorizzazione di «Alzati e fattura LIVE» (Twenty Formula) è di
  Che Livello!, non di Movijoy: non si nomina qui.
- Nessuna stampa, nessun riconoscimento.

## Product Principles

1. **Criteri per cliente, non un chatbot.** Ogni frase sulla pagina
   deve reggere questa differenza: Movijoy risponde secondo regole
   definite per chi lo usa, sopra i criteri ufficiali. Il generico è il
   modo di sparire.
2. **Dire i limiti ad alta voce.** Pronuncia, Speaking in coppia,
   intenzione, certificati, memoria non collegata: scritti con lo
   stesso peso del resto. È l'unica ragione per cui uno sconosciuto crede
   al resto.
3. **Mai promettere un risultato.** Niente esami passati, niente
   garanzie, niente percentuali.
4. **Il prodotto si vende con un contatto, e la pagina deve far
   scrivere.** Finché non esiste un acquisto self-service, l'azione
   della pagina è chiedere — non un tasto «compra» che porta a niente,
   non un rimando al registro di Che Livello!.
5. **Ogni frase è vera.** Niente capacità che il motore non ha, niente
   clienti che non esistono, niente parole come «API» o «plugin» per
   un'integrazione fatta a mano.

## Accessibility & Inclusion

Pubblico italiano, in gran parte da telefono. Fra i clienti che
integrano ci sono scuole, quindi fra gli utenti finali ci sono
adolescenti su telefoni di fascia media: le prestazioni su mobile medio
sono un vincolo reale. La faccia animata e la sfera 3D hanno già un
ripiego senza WebGL e rispettano `prefers-reduced-motion`.
