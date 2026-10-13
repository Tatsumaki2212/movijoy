/**
 * La faccia di Movijoy disegnata per le immagini generate dal server:
 * icona della scheda, icona per iPhone, immagine di condivisione.
 *
 * ⚠️ È LA CROCE DI SAN GIORGIO, non la Union Jack, come la faccia 2D
 * del mondo Business: a sedici pixel la Union Jack è una macchia, la
 * croce lascia quattro campi e gli occhi si vedono. Le proporzioni
 * seguono Faccia.tsx (occhi a ±0,42 del raggio, bocca a −0,54).
 *
 * Solo flex e posizioni assolute: è quello che il motore delle immagini
 * (satori) sa disegnare.
 */
export function FacciaImmagine({ d }: { d: number }) {
  const barra = Math.round(d * 0.2);
  const bordo = Math.max(1, Math.round(d * 0.035));
  const occhio = Math.round(d * 0.1);
  return (
    <div
      style={{
        width: d,
        height: d,
        borderRadius: "50%",
        background: "linear-gradient(145deg, #2c4667 0%, #16233a 55%, #0b1320 100%)",
        position: "relative",
        display: "flex",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: (d - barra) / 2,
          top: 0,
          width: barra,
          height: d,
          background: "#c8102e",
          borderLeft: `${bordo}px solid #f2f3f5`,
          borderRight: `${bordo}px solid #f2f3f5`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: (d - barra) / 2,
          left: 0,
          height: barra,
          width: d,
          background: "#c8102e",
          borderTop: `${bordo}px solid #f2f3f5`,
          borderBottom: `${bordo}px solid #f2f3f5`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: d * 0.5 - d * 0.21 - occhio / 2,
          top: d * 0.5 - d * 0.175 - occhio / 2,
          width: occhio,
          height: occhio,
          borderRadius: "50%",
          background: "#16233a",
          border: `${bordo}px solid #f2f3f5`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: d * 0.5 + d * 0.21 - occhio / 2,
          top: d * 0.5 - d * 0.175 - occhio / 2,
          width: occhio,
          height: occhio,
          borderRadius: "50%",
          background: "#16233a",
          border: `${bordo}px solid #f2f3f5`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: d * 0.5 - d * 0.14,
          top: d * 0.5 + d * 0.2,
          width: d * 0.28,
          height: d * 0.1,
          borderBottom: `${Math.max(1, Math.round(d * 0.045))}px solid #16233a`,
          borderRadius: "0 0 50% 50%",
        }}
      />
    </div>
  );
}
