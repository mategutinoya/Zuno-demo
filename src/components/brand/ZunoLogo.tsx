import { LOGO_CROWN, LOGO_VIEWBOX } from "./logoPaths";
import { BRUSH_PATHS } from "./brush";

interface Props {
  className?: string;
  crown?: boolean;
  crownColor?: string;
  title?: string;
}

export function ZunoLogo({
  className,
  crown = true,
  crownColor = "#FF9B42",
  title = "ZUNO",
}: Props) {
  return (
    <svg
      viewBox={`${LOGO_VIEWBOX.x} ${LOGO_VIEWBOX.y} ${LOGO_VIEWBOX.w} ${LOGO_VIEWBOX.h}`}
      className={className}
      role="img"
      aria-label={title}
      fill="none"
    >
      <title>{title}</title>
      <g fill="currentColor" stroke="currentColor" strokeWidth={1.2} strokeLinejoin="round">
        {BRUSH_PATHS.map((d, i) => (
          <path key={i} d={d} data-letter={i} />
        ))}
      </g>
      {crown && <path d={LOGO_CROWN} fill={crownColor} data-crown />}
    </svg>
  );
}

export function Crown({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="24 0 46 26" className={className} aria-hidden="true">
      <path d={LOGO_CROWN} fill={color} />
    </svg>
  );
}
