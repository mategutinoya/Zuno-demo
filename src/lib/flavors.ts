export type FruitKind =
  | "lychee"
  | "raspberry"
  | "mango"
  | "passion"
  | "achachairu"
  | "lime"
  | "blackberry"
  | "blueberry";

export interface Flavor {
  id: string;
  name: string;
  /** Two lines used on the printed label */
  labelLines: [string, string];
  mood: string;
  description: string;
  notes: string[];
  fruits: FruitKind[];
  /** Liquid colour inside the bottle */
  liquid: string;
  /** Section background gradient: bottom, top, glow */
  bg: [string, string, string];
  /** Text colour that reads on top of the background */
  ink: "light" | "dark";
  accent: string;
  label: {
    top: string;
    bottom: string;
    stroke: string;
    ink: string;
    logo: string;
  };
}

export const FLAVORS: Flavor[] = [
  {
    id: "pink-lychee",
    name: "Pink Lychee",
    labelLines: ["PINK", "LYCHEE"],
    mood: "Elegante · Floral",
    description:
      "Lychee jugoso con un toque de frambuesa. Floral, delicado y con una burbuja fina que se queda en la memoria.",
    notes: ["Lychee", "Frambuesa", "Notas florales"],
    fruits: ["lychee", "raspberry"],
    liquid: "#F25C9E",
    bg: ["#E8478E", "#F9D3E3", "#FFB4D2"],
    ink: "dark",
    accent: "#F05A9D",
    label: { top: "#FBD1E2", bottom: "#F27BB0", stroke: "#FFFFFF", ink: "#17131B", logo: "#17131B" },
  },
  {
    id: "mango-passion",
    name: "Mango Passion",
    labelLines: ["MANGO", "PASSION"],
    mood: "Tropical · Cálido",
    description:
      "Mango maduro y maracuyá en una mezcla tropical, cálida y vibrante. El atardecer, dentro de una botella.",
    notes: ["Mango", "Maracuyá", "Final cítrico"],
    fruits: ["mango", "passion"],
    liquid: "#FFA22E",
    bg: ["#F2702E", "#FFD79A", "#FFB45C"],
    ink: "dark",
    accent: "#FF9B42",
    label: { top: "#FFD27A", bottom: "#FF9B42", stroke: "#FFF3D6", ink: "#17131B", logo: "#17131B" },
  },
  {
    id: "achachairu-citrus",
    name: "Achachairú Citrus",
    labelLines: ["ACHACHAIRÚ", "CITRUS"],
    mood: "Fresco · Luminoso",
    description:
      "El achachairú, joya frutal del oriente boliviano, se encuentra con la lima. Ácido, luminoso y muy refrescante.",
    notes: ["Achachairú", "Lima", "Piel cítrica"],
    fruits: ["achachairu", "lime"],
    liquid: "#CFE05A",
    bg: ["#8DB33A", "#F1F6C8", "#D9EA6E"],
    ink: "dark",
    accent: "#C8D957",
    label: { top: "#EEF5B4", bottom: "#C8D957", stroke: "#FFFFFF", ink: "#17131B", logo: "#17131B" },
  },
  {
    id: "berry-mood",
    name: "Berry Mood",
    labelLines: ["BERRY", "MOOD"],
    mood: "Intenso · Sofisticado",
    description:
      "Mora y arándano en un perfil profundo e intenso. Para las noches que piden algo más sofisticado.",
    notes: ["Mora", "Arándano", "Final seco"],
    fruits: ["blackberry", "blueberry"],
    liquid: "#7A2A7E",
    bg: ["#140E1C", "#5B3484", "#9A4FB8"],
    ink: "light",
    accent: "#8054A8",
    label: { top: "#8E3F86", bottom: "#4A1E52", stroke: "#C78AD8", ink: "#FFF8F2", logo: "#FFF8F2" },
  },
];

export const HERO_BG: [string, string, string] = ["#EE4F95", "#6B3F9E", "#F7A6CB"];
export const DRINK_BG: [string, string, string] = ["#F8C5DA", "#FFF8F2", "#FFE0C7"];
