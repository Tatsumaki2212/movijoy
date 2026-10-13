import type { Metadata } from "next";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import Dialogo from "../components/Dialogo";

export const metadata: Metadata = {
  title: "Parla con Movijoy",
  description: "Cinque domande per capire chi sei e che cosa ti serve. Ti scrive Che Livello!.",
  alternates: { canonical: "/parla" },
  robots: { index: false, follow: true },
};

export default function Parla() {
  return (
    <Cornice>
      <Dialogo />
    </Cornice>
  );
}
