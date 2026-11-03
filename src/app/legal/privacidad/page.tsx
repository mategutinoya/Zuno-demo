import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Política de privacidad" };

export default function Page() {
  return (
    <LegalShell eyebrow="Legal" title="Privacidad">
      <p className="text-sm text-ink/50">Documento base. Debe ser revisado por asesoría legal antes de su publicación.</p>
      <h2>Qué guardamos</h2>
      <p>
        Este sitio no utiliza cookies de seguimiento. Únicamente guardamos en tu navegador (almacenamiento local) la
        confirmación de mayoría de edad, si eliges recordarla, para no volver a preguntarte.
      </p>
      <h2>Contacto comercial</h2>
      <p>
        Si nos escribes por correo, usaremos tus datos solo para responder a tu consulta comercial o de distribución.
      </p>
      <h2>Tus derechos</h2>
      <p>
        Puedes solicitar la eliminación de tus datos escribiendo a{" "}
        <a className="underline" href={`mailto:${SITE.salesEmail}`}>{SITE.salesEmail}</a>.
      </p>
    </LegalShell>
  );
}
