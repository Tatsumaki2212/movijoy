"use client";

import { useEffect, useId, useState } from "react";

/**
 * Movijoy, la faccia.
 *
 * Due bandiere, e non è un vezzo: nel mondo Business è la croce di San
 * Giorgio, nel registro dello studente la Union Jack.
 *
 * Le barre sono incurvate: su una sfera una croce dritta è una croce
 * disegnata SOPRA un cerchio, non una bandiera che lo avvolge. La
 * forma è una lente, appuntita ai poli e larga all'equatore — ed è
 * anche il motivo per cui la Union Jack qui si può fare: la croce di
 * Sant'Andrea è la stessa lente ruotata di 45°, non un secondo
 * disegno da tenere allineato a mano.
 *
 * ⚠️ LA UNION JACK È SEMPLIFICATA, di proposito. Quella vera ha le
 * diagonali CONTRALTERNATE — il rosso non sta al centro del bianco ma
 * spostato, e il verso cambia da un quarto all'altro. A 60 pixel quel
 * dettaglio non si vede, e disegnarlo toglierebbe bianco proprio dove
 * servono gli occhi. Se un giorno questa faccia va grande, è la prima
 * cosa da rimettere.
 *
 * ⚠️ GLI OCCHI HANNO UN ALONE BIANCO. Sulla croce di San Giorgio
 * cadono in un campo bianco e non si vede; sulla Union Jack cadono
 * sulle diagonali, e blu scuro su blu scuro sparisce. È lo stesso
 * trucco già usato per la bocca.
 *
 * ⚠️ Gli identificativi interni sono generati per istanza. Sulla
 * stessa pagina ce ne sono due — il caricamento e l'assistente — e con
 * un id fisso il secondo userebbe il ritaglio del primo: quando il
 * primo sparisce dopo un secondo e mezzo, il secondo perderebbe il
 * ritaglio e la bandiera uscirebbe dalla palla.
 */

const BLU = "#16304d";
const ROSSO = "#c8102e";
/* Il blu di campo della Union Jack. Più cupo del blu del sito, che
   sotto gli occhi e le diagonali bianche diventerebbe slavato. */
const BLU_CAMPO = "#0a2352";

/** Una banda sulla sfera: appuntita ai poli, larga w all'equatore. */
function lente(w: number) {
  return `M60 8 C${60 - w} 40 ${60 - w} 80 60 112 C${60 + w} 80 ${60 + w} 40 60 8 Z`;
}

/** La stessa, coricata. */
function lenteCoricata(w: number) {
  return `M8 60 C40 ${60 - w} 80 ${60 - w} 112 60 C80 ${60 + w} 40 ${60 + w} 8 60 Z`;
}

export default function Faccia({
  classe,
  battito,
  parla,
  bandiera = "inghilterra",
  occhi = "aperti",
}: {
  classe?: string;
  battito?: boolean;
  /** Muove la bocca finché è vero. Il ritmo è quello delle sillabe. */
  parla?: boolean;
  bandiera?: "inghilterra" | "regno-unito";
  /**
   * "croce" mette due X al posto degli occhi. Serve alla pagina 404 e
   * a niente altro: è una faccia che ha sbattuto contro un indirizzo
   * che non esiste.
   */
  occhi?: "aperti" | "croce";
}) {
  const n = useId().replace(/:/g, "");
  const palla = `palla-${n}`;
  const luce = `luce-${n}`;
  const ko = occhi === "croce";
  /* ⚠️ L'HOOK SI CHIAMA SEMPRE, e il ternario sta DOPO. Scritto come
     `boccaDi(ko ? 0 : useApertura(parla))` sarebbe una chiamata
     condizionata: React conta gli hook per posizione, e uno che a
     volte c'è e a volte no disallinea tutti quelli dopo. */
  const apertura = useApertura(parla);
  /* Con le X la bocca non sorride e non parla: un sorriso sopra due
     croci si legge come una faccia che scherza sulla morte, e non è il
     tono di una pagina che dice «questo indirizzo non esiste». Resta
     una riga dritta, che è la faccia di chi non sa cosa dire. */
  const bocca = boccaDi(ko ? 0 : apertura);
  const uk = bandiera === "regno-unito";

  return (
    <svg viewBox="0 0 120 120" className={classe} aria-hidden="true">
      <defs>
        <clipPath id={palla}>
          <circle cx="60" cy="60" r="52" />
        </clipPath>
        {/* La luce viene da sopra a sinistra, come su qualunque cosa
            appoggiata su una scrivania sotto una lampada. */}
        <radialGradient id={luce} cx="35%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#0b1a2b" stopOpacity="0.34" />
        </radialGradient>
      </defs>

      <g clipPath={`url(#${palla})`}>
        {uk ? (
          <>
            <circle cx="60" cy="60" r="52" fill={BLU_CAMPO} />
            {/* Sant'Andrea: la stessa lente della croce, girata. */}
            <g transform="rotate(45 60 60)">
              <path d={lente(11)} fill="#ffffff" />
              <path d={lenteCoricata(11)} fill="#ffffff" />
              <path d={lente(4.5)} fill={ROSSO} />
              <path d={lenteCoricata(4.5)} fill={ROSSO} />
            </g>
            {/* San Giorgio sopra, col suo filetto bianco. */}
            <path d={lente(15)} fill="#ffffff" />
            <path d={lenteCoricata(15)} fill="#ffffff" />
            <path d={lente(9)} fill={ROSSO} />
            <path d={lenteCoricata(9)} fill={ROSSO} />
          </>
        ) : (
          <>
            <circle cx="60" cy="60" r="52" fill="#ffffff" />
            <path d={lente(8)} fill={ROSSO} />
            <path d={lenteCoricata(8)} fill={ROSSO} />
          </>
        )}
        <circle cx="60" cy="60" r="52" fill={`url(#${luce})`} />
      </g>

      {/* Il filo che chiude la palla: senza, il bordo sfuma e sembra
          una macchia invece di un oggetto. */}
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#16304d"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* paint-order="stroke": il filetto bianco si disegna PRIMA e il
          pieno ci va sopra, quindi l'alone cresce solo all'esterno e
          l'occhio resta della sua misura. Con l'ordine normale metà
          filetto mangerebbe l'occhio da dentro. */}
      {ko ? (
        /* Due X. L'alone bianco si disegna PRIMA e più largo, come per
           gli occhi tondi e per la bocca: sulla Union Jack le croci
           cadono sulle diagonali, e blu scuro su blu scuro sparisce.
           Niente className "occhi": una X che sbatte le palpebre è una
           X che è viva, ed è il contrario di quello che dice. */
        <g strokeLinecap="round" fill="none">
          <g stroke="#ffffff" strokeWidth="9" strokeOpacity="0.92">
            <path d="M32 36 L44 48 M44 36 L32 48" />
            <path d="M76 36 L88 48 M88 36 L76 48" />
          </g>
          <g stroke={BLU} strokeWidth="5">
            <path d="M32 36 L44 48 M44 36 L32 48" />
            <path d="M76 36 L88 48 M88 36 L76 48" />
          </g>
        </g>
      ) : (
        <g
          className={battito ? "occhi" : undefined}
          fill={BLU}
          stroke="#ffffff"
          strokeWidth={uk ? 4.5 : 0}
          paintOrder="stroke"
        >
          <ellipse cx="38" cy="42" rx="5" ry="6.5" />
          <ellipse cx="82" cy="42" rx="5" ry="6.5" />
        </g>
      )}

      {/* Il sorriso è centrato, quindi la sua parte più bassa cade
          sulla barra rossa, e blu scuro su rosso si impasta. Si risolve
          come sulla segnaletica vera: un tratto bianco più largo sotto,
          che lo stacca da entrambi i fondi. */}
      <path
        d={ko ? BOCCA_DRITTA : bocca}
        fill={ko ? "none" : "#ffffff"}
        stroke="#ffffff"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="0.92"
      />
      <path
        d={ko ? BOCCA_DRITTA : bocca}
        fill={ko ? "none" : "#16304d"}
        stroke="#16304d"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** La bocca di chi non sa cosa dire: una riga, dove stava il sorriso. */
const BOCCA_DRITTA = "M46 88 L74 88";

/**
 * La bocca, da chiusa a spalancata.
 *
 * Il bordo di SOPRA è sempre il sorriso di prima, identico: quello che
 * scende è il labbro di sotto, come succede a una mandibola vera. Ad
 * apertura zero i due bordi coincidono, la figura ha area nulla e
 * resta esattamente il sorriso che c'era — nessuno stato "a riposo"
 * disegnato a parte da tenere allineato a mano.
 *
 * È un attributo ricalcolato, non una transizione CSS: la proprietà
 * "d" è animabile via CSS solo su una parte dei browser, e una bocca
 * che si muove su Chrome e sta ferma su Safari è peggio di una bocca
 * ferma ovunque.
 */
function boccaDi(apertura: number) {
  const giu = 98 + 15 * apertura;
  return `M42 84 Q60 98 78 84 Q60 ${giu.toFixed(1)} 42 84 Z`;
}

/**
 * Il ritmo del parlato.
 *
 * Ampiezze a caso a intervalli irregolari fra 90 e 190 ms: è la
 * frequenza delle sillabe. A 60 fotogrammi al secondo sembrerebbe una
 * vibrazione, e a intervalli regolari un motorino.
 */
function useApertura(parla?: boolean) {
  const [apertura, setApertura] = useState(0);

  useEffect(() => {
    if (!parla) return;
    // Chi ha chiesto meno movimento riceve la faccia ferma che sorride.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let attivo = true;
    let t = 0;
    const passo = () => {
      if (!attivo) return;
      // Mai completamente chiusa mentre parla: a zero secco sembrerebbe
      // che si sia interrotta a metà parola.
      setApertura(0.25 + Math.random() * 0.75);
      t = window.setTimeout(passo, 90 + Math.random() * 100);
    };
    /* ⚠️ IL PRIMO PASSO È RIMANDATO, NON CHIAMATO QUI DENTRO, ed è
       l'unica differenza voluta rispetto alla copia di chelivello.
       Chiamare passo() subito vuol dire un setState sincrono nel corpo
       dell'effetto: il React Compiler lo segnala (react-hooks/
       set-state-in-effect) perché provoca un secondo render a cascata
       appena finito il primo. Rimandarlo di una sillaba — fra 90 e
       190 ms, lo stesso intervallo di tutti gli altri passi — non si
       vede: la bocca comincia a muoversi con il primo suono, non prima.
       Per lo stesso motivo qui sotto non c'è più setApertura(0) quando
       smette di parlare: la chiusura è derivata nel return. */
    t = window.setTimeout(passo, 90 + Math.random() * 100);

    return () => {
      attivo = false;
      window.clearTimeout(t);
    };
  }, [parla]);

  /* A bocca chiusa quando non parla, per costruzione: non serve scrivere
     lo zero nello stato, e così l'effetto non scrive mai niente in modo
     sincrono. L'ultimo valore resta in memoria finché non riparla, e
     intanto nessuno lo vede. */
  return parla ? apertura : 0;
}
