import { ImageResponse } from "next/og";
import { FacciaImmagine } from "./lib/faccia-immagine";

/* L'icona della scheda: la faccia di Movijoy, generata dal codice. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: 64, height: 64, display: "flex", background: "transparent" }}>
        <FacciaImmagine d={64} />
      </div>
    ),
    size,
  );
}
