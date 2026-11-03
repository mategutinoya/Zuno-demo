import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";

export const metadata: Metadata = { title: "Consumo responsable" };

export default function Page() {
  return (
    <LegalShell eyebrow="ZUNO · Compromiso" title="Consumo responsable">
      <p>
        En ZUNO creemos que disfrutar es parte de la vida, y que hacerlo bien es lo que lo hace diferente. Nuestra
        bebida está pensada para compartir con calma, nunca para excederse.
      </p>
      <h2>Nuestros principios</h2>
      <ul>
        <li>ZUNO es exclusivamente para mayores de 18 años.</li>
        <li>Si vas a manejar, no bebas. Designa un conductor o usa transporte seguro.</li>
        <li>Alterna con agua y acompaña con comida.</li>
        <li>No se recomienda el consumo durante el embarazo o la lactancia.</li>
        <li>No mezcles alcohol con medicamentos sin consultar a un profesional.</li>
        <li>Respeta a quien decide no beber.</li>
      </ul>
      <h2>Nuestra comunicación</h2>
      <p>
        No dirigimos publicidad a menores, no asociamos el consumo con éxito social o rendimiento, y no promovemos el
        consumo excesivo ni rápido de alcohol.
      </p>
      <p>
        Si tú o alguien cercano necesita ayuda con el consumo de alcohol, acude a un centro de salud o a los servicios de
        atención de tu país.
      </p>
    </LegalShell>
  );
}
