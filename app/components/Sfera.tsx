"use client";

import { useEffect, useRef, useState } from "react";
import Faccia from "./Faccia";

/**
 * Movijoy in tre dimensioni.
 *
 * ⚠️ WEBGL SCRITTO A MANO, ZERO DIPENDENZE. Three.js sarebbero mezzo
 * megabyte per disegnare una sfera, su un prodotto che in PRODUCT.md
 * dichiara come vincolo vero le prestazioni su telefoni di fascia
 * media. Qui c'è un'intersezione raggio-sfera analitica — nessun
 * raymarching, nessuna mesh, nessun caricamento — e costa due radici
 * quadrate per pixel.
 *
 * ⚠️ LA BANDIERA AVVOLGE LA SFERA PER DAVVERO. In `Faccia.tsx` le barre
 * della croce sono disegnate come lenti, appuntite ai poli, e il
 * commento là dice il perché: «su una sfera una croce dritta è una
 * croce disegnata SOPRA un cerchio, non una bandiera che lo avvolge».
 * Qui quella cosa diventa letterale: le bande si calcolano sulla
 * NORMALE del punto, quindi sono cerchi massimi, e la curvatura non è
 * disegnata — è geometria. La Union Jack è il saltire di Sant'Andrea
 * ottenuto ruotando la stessa condizione di 45°, come in 2D.
 *
 * ⚠️ L'IRIDESCENZA STA SOLO SUL BORDO, e non è un vezzo: è l'unico
 * modo di avere il materiale del riferimento senza perdere Movijoy.
 * Una sfera iridescente intera sarebbe una bolla di sapone qualunque;
 * la bandiera sparirebbe, e con lei l'identità. Qui l'arcobaleno vive
 * nel fresnel — dove la luce rade — e il centro resta Movijoy.
 *
 * ⚠️ SE WEBGL NON C'È, O SE SI CHIEDE MENO MOVIMENTO, si torna alla
 * faccia in SVG che il sito già usa. Non è un ripiego triste: è lo
 * stesso personaggio, disegnato, e chi arriva vede Movijoy comunque.
 */

const VERTICE = `
attribute vec2 posizione;
void main() { gl_Position = vec4(posizione, 0.0, 1.0); }
`;

/* ⚠️ I COLORI SONO QUELLI VERI DEL MARCHIO, non scelti a occhio qui:
   il rosso della croce è lo stesso di Faccia.tsx e del registro. */
const FRAMMENTO = `
precision highp float;

uniform vec2  risoluzione;
uniform float tempo;
uniform vec2  puntatore;   // -1..1, dove guarda Movijoy
uniform float fermo;       // 1 = niente movimento (prefers-reduced-motion)

const vec3 ROSSO   = vec3(0.784, 0.063, 0.180);
const vec3 BIANCO  = vec3(0.945, 0.949, 0.957);
const vec3 BLU     = vec3(0.039, 0.137, 0.322);
const vec3 FONDO   = vec3(0.039, 0.043, 0.051);

mat3 ruotaY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}
mat3 ruotaX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

/* La bandiera sulla normale: bande che sono cerchi massimi, quindi
   avvolgono invece di stare sopra. */
vec3 bandiera(vec3 n) {
  vec3 col = BLU;

  // Saltire di Sant'Andrea: la stessa condizione, ruotata di 45°.
  float r = 0.70710678;
  vec3 d = vec3((n.x - n.y) * r, (n.x + n.y) * r, n.z);
  if (abs(d.x) < 0.090 || abs(d.y) < 0.090) col = BIANCO;
  if (abs(d.x) < 0.042 || abs(d.y) < 0.042) col = ROSSO;

  // Croce di San Giorgio, sopra: bianco largo, rosso dentro.
  if (abs(n.x) < 0.165 || abs(n.y) < 0.165) col = BIANCO;
  if (abs(n.x) < 0.098 || abs(n.y) < 0.098) col = ROSSO;

  return col;
}

/* Iridescenza da film sottile, solo per il bordo. */
vec3 iride(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (vec3(0.00, 0.33, 0.67) + t));
}

/* ── LA FACCIA ──────────────────────────────────────────────────
   ⚠️ LE PROPORZIONI SONO QUELLE DI Faccia.tsx, NON INVENTATE QUI.
   Là la sfera è r=52 dentro un riquadro da 120: gli occhi stanno a
   cx 38 e 82 (cioè ±0,42 di raggio), cy 42 (+0,35 con la y in su),
   raggi 5 e 6,5 (0,096 e 0,125); la bocca va da 46 a 74 (±0,27) e
   sta a y 88 (−0,54). Qui quei numeri diventano componenti della
   normale: la faccia finisce sulla sfera dove sta sul disegno.

   ⚠️ L'ALONE BIANCO NON È UN EFFETTO: è lo stesso trucco del 2D. Gli
   occhi e la bocca sono blu scuro, e sulle diagonali blu della Union
   Jack sparirebbero. L'alone li tiene leggibili su qualunque parte
   della bandiera ci cadano sopra. */
const vec3 INCHIOSTRO = vec3(0.086, 0.188, 0.302);

/* ⚠️ I NUMERI SONO RIENTRATI RISPETTO AL 2D, e il motivo è la
   prospettiva. Sul disegno piatto il cerchio è ortografico: ±0,42 di
   raggio cade a ±0,42 di quello che si vede. Qui la macchina da presa
   è a distanza finita, quindi verso il bordo la superficie scappa via
   e gli stessi numeri portavano gli occhi quasi sul profilo — due
   anelli invece di due occhi. Rientrati a ±0,36 e abbassati, tornano
   dove stanno sul disegno. */
float dentroOcchio(vec2 p, float lato, float chiusura) {
  vec2 c = vec2(lato * 0.36, 0.22);
  float rx = 0.082;
  /* Battito di ciglia: l'occhio si schiaccia, non sparisce. */
  float ry = max(0.108 * (1.0 - chiusura), 0.011);
  vec2 d = (p - c) / vec2(rx, ry);
  return dot(d, d);
}

float dentroBocca(vec2 p, float apertura) {
  /* La riga del sorriso: una parabola larga, che risale agli angoli. */
  /* Il coefficiente era 0,38 e su una bocca larga mezzo raggio dava
     una risalita di due centesimi: una riga dritta, non un sorriso. */
  float y0 = -0.33 + 1.15 * p.x * p.x;
  float hh = 0.026 + apertura * 0.135;
  vec2 d = vec2(p.x / 0.235, (p.y - y0) / hh);
  return dot(d, d);
}

/* Il colore della sfera visto da una direzione. */
vec3 colorePalla(vec3 p, vec3 n, vec3 raggio, mat3 giro, float chiusura, float apertura) {
  vec3 nObj = giro * n;
  vec3 base = bandiera(nObj);

  /* La faccia, sopra la bandiera. Solo sull'emisfero davanti: alle
     spalle Movijoy ha la bandiera e basta, come una testa. */
  if (nObj.z > 0.08) {
    vec2 f = nObj.xy;

    float od = dentroOcchio(f,  1.0, chiusura);
    float os = dentroOcchio(f, -1.0, chiusura);
    float bo = dentroBocca(f, apertura);

    /* Prima gli aloni, poi l'inchiostro sopra: l'ordine conta, come
       nel disegno 2D, o il filetto mangia l'occhio da dentro. */
    /* L'alone è il 30% oltre il bordo, non il 57%: più largo di così
       smette di essere un alone e diventa una montatura. */
    if (od < 1.7 || os < 1.7 || bo < 1.7) base = vec3(0.945, 0.949, 0.957);
    if (od < 1.0 || os < 1.0 || bo < 1.0) base = INCHIOSTRO;
  }

  vec3 luce = normalize(vec3(-0.45, 0.75, 0.55));
  float diff = max(dot(n, luce), 0.0);
  float amb  = 0.22 + 0.16 * max(n.y, 0.0);

  // Lacca: riflesso stretto e duro.
  vec3 h = normalize(luce - raggio);
  float spec = pow(max(dot(n, h), 0.0), 120.0) * 0.9;

  // Seconda luce fredda da destra, per staccare il bordo dal fondo.
  vec3 luce2 = normalize(vec3(0.9, -0.1, 0.35));
  float diff2 = max(dot(n, luce2), 0.0) * 0.28;

  float fres = pow(1.0 - max(dot(n, -raggio), 0.0), 3.0);

  vec3 col = base * (amb + diff * 0.85) + base * diff2 * vec3(0.55, 0.70, 1.0);
  col += iride(fres * 1.4 + tempo * 0.03) * fres * 0.55;
  col += vec3(spec);

  return col;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - risoluzione) / min(risoluzione.x, risoluzione.y);

  float t = fermo > 0.5 ? 0.0 : tempo;

  // Macchina da presa ferma, soggetto che respira.
  // ⚠️ Occhio vicino di proposito: a 3.05 la sfera era un soggetto
  // dentro una scatola, non il protagonista della pagina.
  /* ⚠️ ALL'ALTEZZA DEL CENTRO DELLA SFERA. Prima la macchina da presa
     stava 20 centesimi più in basso e si guardava Movijoy dal basso in
     su: finché c'era solo la bandiera non si notava, con una faccia
     sopra sì — gli occhi finivano a ridosso del profilo. */
  vec3 occhio = vec3(0.0, 0.46, 2.95);
  vec3 raggio = normalize(vec3(uv, -1.75));

  float respiro = sin(t * 0.55) * 0.055;
  /* Alzata quel tanto che basta a lasciare sotto il riflesso: senza
     spazio sotto, la sfera non galleggia — sta appoggiata al bordo. */
  vec3 centro = vec3(0.0, 0.46 + respiro, 0.0);
  float R = 1.0;

  /* ⚠️ NIENTE ROTAZIONE COSTANTE. Prima c'era un "t * 0.11" che faceva
     girare la testa in continuazione: una testa che gira sempre non
     può guardare niente, e appena ci sono due occhi la differenza si
     vede subito. Resta un dondolio minimo, che è quello che fa
     sembrare viva una cosa ferma. */
  float dondolio = sin(t * 0.37) * 0.05;
  /* ⚠️ IL SEGNO DELLA X È NEGATIVO, E NON PER CASO. In GLSL mat3(...)
     riempie la matrice PER COLONNE, non per righe: leggendola per
     righe il verso della rotazione viene fuori rovesciato, ed è
     esattamente l'errore che aveva questa riga — cursore a destra,
     testa a sinistra. La faccia sta dove giro*n vale (0,0,1), cioè in
     n = (-sin a, 0, cos a): per mandarla a destra serve a < 0.
     In verticale il segno era già giusto, e infatti su e giù
     funzionava. */
  mat3 giro = ruotaX(-puntatore.y * 0.34 - 0.05 + sin(t * 0.29) * 0.025)
            * ruotaY(-puntatore.x * 0.62 + dondolio);

  /* Il battito di ciglia: raro e rapido, come quello vero. */
  float ciclo = fract(t * 0.19);
  float chiusura = exp(-pow((ciclo - 0.03) / 0.016, 2.0));

  /* Ogni tanto dice qualcosa: la bocca si muove sul ritmo delle
     sillabe, non a caso. */
  float turno = step(0.74, fract(t * 0.082));
  float apertura = turno * (0.35 + 0.35 * sin(t * 10.5) + 0.3 * sin(t * 6.3));

  vec3 col = FONDO;

  // Un alone dietro, che stacca la sfera dal nero.
  float alone = exp(-length(uv - vec2(0.0, 0.25)) * 1.9);
  col += vec3(0.10, 0.14, 0.24) * alone * 0.55;

  // ── La sfera ───────────────────────────────────────────────
  vec3 oc = occhio - centro;
  float b = dot(oc, raggio);
  float c = dot(oc, oc) - R * R;
  float disc = b * b - c;

  float colpita = 0.0;
  if (disc > 0.0) {
    float dist = -b - sqrt(disc);
    if (dist > 0.0) {
      vec3 p = occhio + raggio * dist;
      vec3 n = normalize(p - centro);
      col = colorePalla(p, n, raggio, giro, chiusura, apertura);
      colpita = 1.0;
    }
  }

  // ── Il piano, e il riflesso ────────────────────────────────
  if (colpita < 0.5 && raggio.y < -0.001) {
    float dp = (-0.62 - occhio.y) / raggio.y;
    if (dp > 0.0) {
      vec3 pp = occhio + raggio * dp;

      // Il pavimento: nero, con una luce lontana.
      float lontano = exp(-length(pp.xz) * 0.22);
      vec3 pav = FONDO + vec3(0.05, 0.07, 0.11) * lontano;

      // Riflesso speculare della sfera nel piano.
      vec3 rifl = reflect(raggio, vec3(0.0, 1.0, 0.0));
      vec3 oc2 = pp - centro;
      float b2 = dot(oc2, rifl);
      float c2 = dot(oc2, oc2) - R * R;
      float d2 = b2 * b2 - c2;
      if (d2 > 0.0) {
        float t2 = -b2 - sqrt(d2);
        if (t2 > 0.0) {
          vec3 p2 = pp + rifl * t2;
          vec3 n2 = normalize(p2 - centro);
          vec3 cr = colorePalla(p2, n2, rifl, giro, chiusura, apertura);
          /* Il riflesso si spegne con la distanza: un riflesso nitido
             fino al bordo dello schermo è uno specchio, non un
             pavimento. */
          float fade = exp(-length(pp.xz - centro.xz) * 0.95) * 0.42;
          pav = mix(pav, cr, clamp(fade, 0.0, 1.0));
        }
      }
      col = pav;
    }
  }

  // Vignettatura: tiene l'occhio al centro.
  col *= 1.0 - 0.38 * pow(length(uv) * 0.55, 2.0);

  // Grana finissima, per togliere le bande dai gradienti.
  float grana = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grana - 0.5) * 0.015;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compila(gl: WebGLRenderingContext, tipo: number, sorgente: string) {
  const s = gl.createShader(tipo);
  if (!s) return null;
  gl.shaderSource(s, sorgente);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function Sfera({ classe }: { classe?: string }) {
  const tela = useRef<HTMLCanvasElement | null>(null);
  const [senzaWebgl, setSenzaWebgl] = useState(false);

  useEffect(() => {
    const canvas = tela.current;
    if (!canvas) return;

    const gl =
      (canvas.getContext("webgl", { antialias: false, alpha: false }) as WebGLRenderingContext | null) ??
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) {
      setSenzaWebgl(true);
      return;
    }

    const vs = compila(gl, gl.VERTEX_SHADER, VERTICE);
    const fs = compila(gl, gl.FRAGMENT_SHADER, FRAMMENTO);
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) {
      setSenzaWebgl(true);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      setSenzaWebgl(true);
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, "posizione");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRis = gl.getUniformLocation(prog, "risoluzione");
    const uTempo = gl.getUniformLocation(prog, "tempo");
    const uPunt = gl.getUniformLocation(prog, "puntatore");
    const uFermo = gl.getUniformLocation(prog, "fermo");

    const menoMoto = window.matchMedia("(prefers-reduced-motion: reduce)");
    let fermo = menoMoto.matches;
    const cambiaMoto = () => {
      fermo = menoMoto.matches;
    };
    menoMoto.addEventListener("change", cambiaMoto);

    /* ⚠️ Il puntatore si insegue con un ritardo invece di saltare al
       valore nuovo: un Movijoy che scatta sembra un cursore, uno che
       arriva dopo sembra che ti stia guardando. */
    /* ⚠️ DUE MODI DI GUARDARE, perché ci sono due modi di stare davanti
       a una pagina. Su un computer c'è un cursore e Movijoy lo segue.
       Su un telefono il cursore non esiste: lì l'unica cosa che dice
       dove sta andando l'attenzione è lo scorrimento, e Movijoy guarda
       in quella direzione. Attaccare l'ascolto del puntatore anche sul
       telefono farebbe muovere la testa a ogni tocco, che è il
       contrario di seguire qualcuno. */
    const grossolano = window.matchMedia("(pointer: coarse)").matches;

    let mira = { x: 0, y: 0 };
    const dove = { x: 0, y: 0 };
    /* Velocità di scorrimento, normalizzata e con memoria corta. */
    let scorre = 0;

    const alPuntatore = (e: PointerEvent) => {
      mira = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };

    let eraA = window.scrollY;
    const alloScorrimento = () => {
      const adesso = window.scrollY;
      const passo = adesso - eraA;
      eraA = adesso;
      /* Diviso 14: con una scorsa normale del pollice si arriva al
         massimo, con un assestamento di due pixel quasi a niente. */
      scorre = Math.max(-1, Math.min(1, passo / 14));
    };

    if (grossolano) {
      window.addEventListener("scroll", alloScorrimento, { passive: true });
    } else {
      window.addEventListener("pointermove", alPuntatore, { passive: true });
    }

    /* ⚠️ Arrow function e non `function`: una dichiarazione è issata, e
       TypeScript non può sapere che quando la chiami il controllo su
       `gl` è già passato. Con la const il restringimento regge. */
    const misura = () => {
      const c = tela.current;
      if (!c) return;
      /* Mai oltre 1.75: su un telefono di fascia media il doppio dei
         pixel non si vede e i fotogrammi sì. */
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      const w = Math.round(c.clientWidth * dpr);
      const h = Math.round(c.clientHeight * dpr);
      if (c.width !== w || c.height !== h) {
        c.width = w;
        c.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let vivo = true;
    let visibile = true;
    const occhio = new IntersectionObserver(
      ([v]) => {
        visibile = v.isIntersecting;
      },
      { threshold: 0.01 },
    );
    occhio.observe(canvas);

    const partito = performance.now();
    let richiesta = 0;

    const disegna = (ora: number) => {
      richiesta = requestAnimationFrame(disegna);
      if (!vivo) return;

      /* ⚠️ LA MISURA VIENE PRIMA DEL CONTROLLO SULLA VISIBILITÀ. Una
         scheda che nasce in secondo piano non disegna — giusto — ma se
         saltasse anche la misura, il primo fotogramma al ritorno
         uscirebbe alla dimensione di partenza del canvas (300×150) e
         si vedrebbe la sfera scattare a fuoco. Misurare costa niente. */
      misura();

      /* Fuori vista o scheda nascosta: non si disegna. Una pagina
         aperta e dimenticata non deve far girare la ventola. */
      if (!visibile || document.hidden) return;

      const c = tela.current;
      if (!c) return;

      if (grossolano) {
        /* Sul telefono la mira è la velocità di scorrimento, che si
           spegne da sola: smetti di scorrere e Movijoy torna a
           guardarti. Senza questo resterebbe fisso a guardare in
           basso per sempre. */
        mira = { x: 0, y: scorre };
        scorre *= 0.9;
      }
      dove.x += (mira.x - dove.x) * 0.045;
      dove.y += (mira.y - dove.y) * 0.045;

      gl.uniform2f(uRis, c.width, c.height);
      gl.uniform1f(uTempo, (ora - partito) / 1000);
      gl.uniform2f(uPunt, dove.x, dove.y);
      gl.uniform1f(uFermo, fermo ? 1 : 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    richiesta = requestAnimationFrame(disegna);

    return () => {
      vivo = false;
      cancelAnimationFrame(richiesta);
      occhio.disconnect();
      window.removeEventListener("pointermove", alPuntatore);
      window.removeEventListener("scroll", alloScorrimento);
      menoMoto.removeEventListener("change", cambiaMoto);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  if (senzaWebgl) {
    return (
      <div className={classe} data-senza-webgl="">
        <Faccia classe="mj-faccia" parla={false} bandiera="regno-unito" />
      </div>
    );
  }

  /* ⚠️ IL CONTENITORE NON È DECORATIVO: SPEZZA UN ANELLO DI RETROAZIONE.
     Un <canvas> ha una dimensione INTRINSECA che viene dai suoi
     attributi width/height. Se lo si posiziona con i soli `inset` e si
     calcolano quegli attributi dal suo stesso clientWidth, ogni giro
     lo fa crescere: misuro 800, scrivo 1400 di buffer, il canvas
     diventa intrinsecamente 1400, lo misuro 1400, scrivo 2450…
     Misurato in pagina prima della correzione: 17315 × 8675 pixel,
     cioè centocinquanta megapixel per disegnare una palla.
     Col contenitore la misura a schermo la decide il CSS (inset:0 +
     100%), e il buffer non può più tirarsela dietro. */
  return (
    <div className={classe}>
      <canvas
        ref={tela}
        className="mj-tela__gl"
        aria-hidden="true"
        /* Movijoy è decorazione per chi legge con uno screen reader: il
           testo accanto dice tutto, e un canvas annunciato sarebbe solo
           rumore. */
      />
    </div>
  );
}
