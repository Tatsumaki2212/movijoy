import { ImageResponse } from "next/og";
import { FacciaImmagine } from "./lib/faccia-immagine";

/**
 * L'immagine che compare quando il sito viene condiviso: WhatsApp,
 * LinkedIn, Instagram, le anteprime dei motori. Il mondo scuro, il
 * titolo del primo schermo e la faccia. Generata dal codice: nessun
 * file da tenere aggiornato.
 */
export const alt = "Movijoy — l'intelligenza artificiale che corregge il tuo inglese scritto";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImmagineCondivisione() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "70px 90px",
          background: "linear-gradient(180deg, #070b11 0%, #0b1320 60%, #0f1a2a 100%)",
          color: "#e9eff7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ fontSize: 24, letterSpacing: 6, fontWeight: 700, color: "#93a6bd", marginBottom: 36 }}>
            MOVIJOY<span style={{ color: "#c8102e" }}>.</span>
          </div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.95, letterSpacing: -4, display: "flex", flexDirection: "column" }}>
            <span>Scrivi.</span>
            <span>Ti dico dove</span>
            <span style={{ color: "#c8102e" }}>perdi il punto.</span>
          </div>
          <div style={{ fontSize: 26, color: "#93a6bd", marginTop: 34, lineHeight: 1.35 }}>
            L&apos;intelligenza artificiale che corregge l&apos;inglese scritto sui criteri
            ufficiali Cambridge e IELTS, con i tuoi criteri.
          </div>
        </div>
        <FacciaImmagine d={340} />
      </div>
    ),
    size,
  );
}
