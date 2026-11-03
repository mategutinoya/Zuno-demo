import type { Metadata } from "next";
import { LegalShell } from "@/components/layout/LegalShell";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Términos de uso" };

export default function Page() {
  return (
    <LegalShell eyebrow="Legal" title="Términos de uso">
      <p className="text-sm text-ink/50">Documento base. Debe ser revisado por asesoría legal antes de su publicación.</p>
      <h2>1. Acceso</h2>
      <p>
        Este sitio contiene información sobre bebidas alcohólicas y está dirigido exclusivamente a personas mayores de{" "}
        {SITE.legalAge} años. Al confirmar tu edad declaras cumplir con la edad legal para consumir alcohol en tu país.
      </p>
      <h2>2. Propiedad intelectual</h2>
      <p>
        La marca ZUNO, su logotipo, la corona, las etiquetas, imágenes, textos y elementos visuales son propiedad de sus
        titulares y no pueden utilizarse sin autorización previa y por escrito.
      </p>
      <h2>3. Información de producto</h2>
      <p>
        La información sobre sabores, presentación y graduación alcohólica es referencial. La graduación de 4.5% Alc.
        Vol. corresponde a un objetivo de formulación sujeto a validación.
      </p>
      <h2>4. Contacto</h2>
      <p>
        Para consultas escribe a <a className="underline" href={`mailto:${SITE.salesEmail}`}>{SITE.salesEmail}</a>.
      </p>
    </LegalShell>
  );
}
