export type Concept = {
  key: "A" | "B" | "C";
  href: string;
  name: string;
  thesis: string;
  signature: string;
  type: string;
  tech: string;
  swatches: string[];
};

export const concepts: Concept[] = [
  {
    key: "A",
    href: "/concept-a",
    name: "Energy Intelligence",
    thesis: "La factura és un senyal i SavEnergy IA el troba. Un instrument de mesura: retícula, traç fòsfor i lectures.",
    signature: "Un camp 3D de traços que passa de soroll a senyal net; la factura s’escaneja fixada al scroll.",
    type: "Geologica + Martian Mono (només per a mesures)",
    tech: "Three.js (shader propi), GSAP ScrollTrigger, SplitText, Lenis",
    swatches: ["#040706", "#0b1412", "#3dff9a", "#ffbe55", "#eef2ef"],
  },
  {
    key: "B",
    href: "/concept-b",
    name: "Premium Minimal",
    thesis: "Un objecte, una frase, una acció. La factura és el producte i el verd només apareix com a llum.",
    signature: "La factura gira a l’espai, és llegida i s’obre en tres capes (vista explosionada).",
    type: "Bodoni Moda (especimen i titulars) + Hanken Grotesk",
    tech: "CSS 3D + GSAP ScrollTrigger (pin, scrub, scroll horitzontal), SplitText, Lenis",
    swatches: ["#0a0b0a", "#141614", "#f5f6f3", "#2ee88f", "#0a7a45"],
  },
  {
    key: "C",
    href: "/concept-c",
    name: "Energy Revolution",
    thesis: "El teu perfil de consum mou la pàgina. Llar o empresa redibuixa les cintes, el gràfic i l’anàlisi.",
    signature: "Cintes generatives calculades a partir d’una corba horària; producte real en panells nítids.",
    type: "Bricolage Grotesque + Schibsted Grotesk",
    tech: "Canvas generatiu, GSAP ScrollTrigger, SplitText, seccions diagonals, Lenis",
    swatches: ["#f7f8f5", "#0b1f17", "#18d680", "#8cf0d6", "#061911"],
  },
];

