import type { Metadata } from "next";
import "../movijoy.css";
import Cornice from "../components/Cornice";
import Grazie from "../components/Grazie";

export const metadata: Metadata = {
  title: "Grazie",
  description: "Le tue risposte sono arrivate: Lorenzo e Gaspare ti scrivono.",
  alternates: { canonical: "/grazie" },
  robots: { index: false, follow: false },
};

export default function PaginaGrazie() {
  return (
    <Cornice>
      <Grazie />
    </Cornice>
  );
}
