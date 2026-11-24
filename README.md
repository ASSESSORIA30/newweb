# Assessoria 3.0 · Propostes de la nova pàgina principal (fase 1)

Tres prototips navegables de la home amb SavEnergy IA com a protagonista.

| Ruta | Proposta |
| --- | --- |
| `/` | Selector i comparativa de les tres propostes (previsualitzacions en viu, escriptori/mòbil) |
| `/concept-a` | A · Energy Intelligence — instrument de mesura, camp 3D (Three.js) de soroll a senyal |
| `/concept-b` | B · Premium Minimal — grafit i porcellana, la factura en 3D i vista explosionada |
| `/concept-c` | C · Energy Revolution — el perfil de consum (llar/empresa) genera cintes i gràfics |

## Paletes del Concept A

`/concept-a` té un selector de paleta (cantonada inferior esquerra; en mòbil, un botó amb la mostra de color). El canvi és instantani, amb una fosa de color de 450 ms i el camp Three.js retenyit amb GSAP, sense recarregar.

| Codi | Paleta | Enllaç directe |
| --- | --- | --- |
| A | Original | `/concept-a` |
| A1 | Deep Blue & Cyan | `/concept-a?paleta=a1` |
| A2 | Champagne & Graphite | `/concept-a?paleta=a2` |
| A3 | Electric Blue & White (clara) | `/concept-a?paleta=a3` |
| A4 | Midnight Violet | `/concept-a?paleta=a4` |

Font única de colors: `src/concepts/a/palettes.ts` (tokens semàntics per paleta; totes les parelles de text compleixen WCAG AA).

## Posar-ho en marxa

```bash
npm install
npm run dev        # http://localhost:3000
```

Per valorar la fluïdesa real de les animacions, millor la versió optimitzada:

```bash
npm run build && npm run start
```

## Què és real i què és simulat

- **Web actual:** serveis, oficines, telèfons i correu. Font única: `src/lib/content.ts`.
- **Pendent de verificació:** xifres (+3.000 estudis, +500.000 €, +30 comercialitzadores) i testimonis. Es mostren amb l’etiqueta «Dades de la web actual · pendents de verificació» (`EVIDENCE_NOTE`) fins que el client les confirmi expressament.
- **Simulat:** l’anàlisi de SavEnergy IA (`src/lib/useBillAnalysis.ts`), la factura d’exemple, el perfil horari i la xifra d’estalvi (`src/lib/bill-demo.ts`). Tot porta l’etiqueta «Simulació de demostració · sense connexió al CRM». El fitxer pujat no surt del navegador.
- **Fase 2:** substituir `useBillAnalysis` per crides al lector de factures, motor de comparatives i catàleg de tarifes del CRM.

## Tecnologia

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + ScrollTrigger + SplitText (`@gsap/react`) · Lenis · Three.js (concepte A) · `<ViewTransition>` de React per a les transicions entre pàgines. Tipografies auto-allotjades amb Fontsource.

Accessibilitat: `prefers-reduced-motion` (sense pins ni bucles), botó per aturar les animacions ambientals, focus visible, navegació per teclat (pestanyes amb fletxes), hover només amb punter fi.

## Skills utilitzades (`.claude/skills/`)

Frontend Design (Anthropic), UI/UX Pro Max, GSAP Skills (8), Impeccable, Vercel React Best Practices, Web Design Guidelines, Vercel React View Transitions i les skills d’Emil Kowalski (emil-design-eng, apple-design, animate, review-animations, animation-performance, animation-vocabulary, choreograph…).

Context de producte per a Impeccable: `PRODUCT.md`; contractes de direcció per proposta: `.impeccable/surfaces/`.
