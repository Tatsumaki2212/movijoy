import { ImageResponse } from "next/og";
import { FacciaImmagine } from "./lib/faccia-immagine";

/* L'icona per la schermata iniziale di iPhone e iPad: fondo scuro
   pieno (iOS non vuole trasparenze) e la faccia con un margine. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#070b11",
        }}
      >
        <FacciaImmagine d={140} />
      </div>
    ),
    size,
  );
}
