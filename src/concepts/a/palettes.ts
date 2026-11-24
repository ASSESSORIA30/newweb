// Concept A colour worlds. The structure, motion and type family stay the same;
// only these tokens change. Every pair used for text is checked for WCAG AA in scripts/check-contrast.
export type PaletteId = "original" | "a1" | "a2" | "a3" | "a4";

export type Palette = {
  id: PaletteId;
  code: string;
  name: string;
  scheme: "dark" | "light";
  swatch: [string, string, string];
  // Three.js field
  fieldLead: string;
  fieldDim: string;
  fieldBlend: "add" | "normal";
  tokens: Record<string, string>;
};

const t = (o: Record<string, string>) => o;

export const palettes: Palette[] = [
  {
    id: "original",
    code: "A",
    name: "Original",
    scheme: "dark",
    swatch: ["#040706", "#3dff9a", "#eef2ef"],
    fieldLead: "#3dff9a",
    fieldDim: "#5f7f78",
    fieldBlend: "add",
    tokens: t({
      bg: "#040706", surface: "#08100e", panel: "#0b1412", screen: "#030605",
      ink: "#e6efea", "ink-2": "#b8c7c0", muted: "#93a69e", "line-solid": "#2c3a36",
      accent: "#3dff9a", "accent-text": "#3dff9a", "accent-hover": "#7dffbd", "on-accent": "#02130a",
      warn: "#ffbe55", paper: "#eef2ef", "paper-ink": "#0c1512", "paper-muted": "#4a5a54",
      "paper-line": "#c9d2cd", "accent-on-paper": "#08703d", "warn-on-paper": "#8a5414",
      shadow: "rgb(0 0 0 / 0.85)", highlight: "rgb(255 255 255 / 0.05)",
      "display-weight": "500", shrp: "100",
    }),
  },
  {
    id: "a1",
    code: "A1",
    name: "Deep Blue & Cyan",
    scheme: "dark",
    swatch: ["#07111F", "#00BFE7", "#B8E5FF"],
    fieldLead: "#00BFE7",
    fieldDim: "#5d8fba",
    fieldBlend: "add",
    tokens: t({
      bg: "#07111F", surface: "#0B1A2E", panel: "#142B45", screen: "#050D18",
      ink: "#F8FAFC", "ink-2": "#CFE3F5", muted: "#9DB3C9", "line-solid": "#22384F",
      accent: "#00BFE7", "accent-text": "#00BFE7", "accent-hover": "#B8E5FF", "on-accent": "#031522",
      warn: "#F5C77E", paper: "#F8FAFC", "paper-ink": "#07111F", "paper-muted": "#44566B",
      "paper-line": "#D5DEE8", "accent-on-paper": "#00708A", "warn-on-paper": "#8A5414",
      shadow: "rgb(1 6 14 / 0.85)", highlight: "rgb(184 229 255 / 0.06)",
      "display-weight": "500", shrp: "100",
    }),
  },
  {
    id: "a2",
    code: "A2",
    name: "Champagne & Graphite",
    scheme: "dark",
    swatch: ["#101114", "#C6A875", "#E7DBC8"],
    fieldLead: "#C6A875",
    fieldDim: "#7a6f5c",
    fieldBlend: "add",
    tokens: t({
      bg: "#101114", surface: "#17181C", panel: "#292B30", screen: "#0B0C0E",
      ink: "#FAF9F6", "ink-2": "#E7DBC8", muted: "#ABA79F", "line-solid": "#34363C",
      accent: "#C6A875", "accent-text": "#C6A875", "accent-hover": "#E7DBC8", "on-accent": "#17130B",
      warn: "#E9A86B", paper: "#FAF9F6", "paper-ink": "#101114", "paper-muted": "#5C5952",
      "paper-line": "#E3DDD2", "accent-on-paper": "#7D6232", "warn-on-paper": "#8A5414",
      shadow: "rgb(0 0 0 / 0.8)", highlight: "rgb(231 219 200 / 0.06)",
      "display-weight": "400", shrp: "0",
    }),
  },
  {
    id: "a3",
    code: "A3",
    name: "Electric Blue & White",
    scheme: "light",
    swatch: ["#FFFFFF", "#2458FF", "#10203D"],
    fieldLead: "#2458FF",
    fieldDim: "#84B9FF",
    fieldBlend: "normal",
    tokens: t({
      bg: "#FFFFFF", surface: "#F0F4FA", panel: "#F0F4FA", screen: "#F0F4FA",
      ink: "#10203D", "ink-2": "#2C3D5C", muted: "#4E5D7A", "line-solid": "#C9D4E6",
      accent: "#2458FF", "accent-text": "#1C4BE0", "accent-hover": "#1A45D6", "on-accent": "#FFFFFF",
      warn: "#9A4F00", paper: "#10203D", "paper-ink": "#FFFFFF", "paper-muted": "#B5C3DC",
      "paper-line": "#2A3C5E", "accent-on-paper": "#84B9FF", "warn-on-paper": "#F5C77E",
      shadow: "rgb(16 32 61 / 0.22)", highlight: "rgb(255 255 255 / 0.7)",
      "display-weight": "600", shrp: "60",
    }),
  },
  {
    id: "a4",
    code: "A4",
    name: "Midnight Violet",
    scheme: "dark",
    swatch: ["#090C19", "#635BFF", "#A78BFA"],
    fieldLead: "#A78BFA",
    fieldDim: "#635BFF",
    fieldBlend: "add",
    tokens: t({
      bg: "#090C19", surface: "#10142A", panel: "#1C2140", screen: "#070914",
      ink: "#F5F5FF", "ink-2": "#D9D6FF", muted: "#A3A6C7", "line-solid": "#262B4D",
      accent: "#635BFF", "accent-text": "#A78BFA", "accent-hover": "#4D45EB", "on-accent": "#FFFFFF",
      warn: "#F0B86E", paper: "#F5F5FF", "paper-ink": "#090C19", "paper-muted": "#4C4F6E",
      "paper-line": "#DCDCF0", "accent-on-paper": "#4B43E0", "warn-on-paper": "#8A5414",
      shadow: "rgb(2 3 10 / 0.85)", highlight: "rgb(167 139 250 / 0.07)",
      "display-weight": "500", shrp: "100",
    }),
  },
];

export const paletteById = Object.fromEntries(palettes.map((p) => [p.id, p])) as Record<PaletteId, Palette>;
