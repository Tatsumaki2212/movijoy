/**
 * La società dietro Movijoy.
 *
 * ⚠️ È UNA COPIA, TENUTA ALLINEATA A MANO, di app/lib/societa.ts del
 * repository di chelivello (piattaforma-inglese). I due siti sono due
 * progetti separati ma la società è una sola: «Che Livello!» S.r.l.,
 * costituita il 6 ottobre 2026 a Genova. Quando un dato cambia di là —
 * il numero REA, in particolare, che oggi manca — va cambiato anche
 * qui, lo stesso giorno. Un sito che dichiara dati societari diversi
 * dall'altro è il tipo di incoerenza che si scopre nel momento
 * peggiore.
 *
 * ⚠️ NIENTE NUMERI INVENTATI. Il REA resta `null` finché non esiste:
 * un numero plausibile su una pagina legale è peggio di un campo
 * vuoto, perché un campo vuoto si vede e un numero finto no.
 */
export const SOCIETA = {
  denominazione: "«Che Livello!» S.r.l.",
  indirizzo: "Via Adamo Centurione 13/1",
  citta: "Genova",
  capitale: "1.000,00 €",
  /* Per le società di capitali italiane il codice fiscale coincide con
     la partita IVA: non è un errore di copiatura. */
  partitaIva: "03106090990" as string | null,
  codiceFiscale: "03106090990" as string | null,
  rea: "GE-533423" as string | null,
  costituita: "6 ottobre 2026",
} as const;

/**
 * La riga da stampare in fondo alle pagine. Mette solo quello che
 * esiste: niente trattini al posto di un dato mancante.
 */
export function rigaSocieta(): string {
  const pezzi = [
    SOCIETA.denominazione,
    `${SOCIETA.indirizzo}, ${SOCIETA.citta}`,
    `capitale sociale ${SOCIETA.capitale} i.v.`,
  ];
  if (SOCIETA.partitaIva && SOCIETA.codiceFiscale === SOCIETA.partitaIva) {
    pezzi.push(`P.IVA e C.F. ${SOCIETA.partitaIva}`);
  } else {
    if (SOCIETA.partitaIva) pezzi.push(`P.IVA ${SOCIETA.partitaIva}`);
    if (SOCIETA.codiceFiscale) pezzi.push(`C.F. ${SOCIETA.codiceFiscale}`);
  }
  /* L'art. 2250 c.c. vuole anche l'ufficio del Registro: il numero è il C.F. qui sopra. */
  if (SOCIETA.rea) pezzi.push(`Registro Imprese di ${SOCIETA.citta} · REA ${SOCIETA.rea}`);
  return pezzi.join(" · ");
}
