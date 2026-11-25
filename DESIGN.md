---
name: Assessoria 3.0 — A3 Signature Green
description: Energy advisory with people behind the technology. A glass 3.0 ring on a luminous natural-white ground, energy ordered into the corporate green, deep green kept for a few cinematic moments.
colors:
  green-950: "#0B241C"
  green-900: "#12382D"
  green-800: "#145A41"
  green-700: "#176B4D"
  green-500: "#38A879"
  green-300: "#7CC79F"
  green-200: "#A8DFBD"
  green-100: "#DCEDE2"
  green-50: "#EDF6F0"
  white-natural: "#FAFCFB"
  surface: "{colors.white-natural}"
  surface-raised: "#FFFFFF"
  surface-tint: "{colors.green-50}"
  surface-deep: "{colors.green-900}"
  ink: "{colors.green-900}"
  ink-soft: "#2B4A3F"
  ink-muted: "#4A6359"
  ink-faint: "#6B8379"
  brand: "{colors.green-700}"
  brand-press: "{colors.green-800}"
  accent: "{colors.green-500}"
  accent-soft: "{colors.green-200}"
  on-deep-2: "#C3DCCD"
  simulation: "#9A4F00"
  simulation-on-deep: "#F5C77E"
  line: "rgba(18, 56, 45, 0.12)"
typography:
  display:
    fontFamily: "Anybody Variable, Geologica Variable, system-ui, sans-serif"
    fontSize: "clamp(2.4rem, 4.2vw, 4.8rem)"
    fontWeight: 700
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Geologica Variable, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Geologica Variable, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Geologica Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  small:
    fontFamily: "Geologica Variable, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  measure:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.82em"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "0em"
rounded:
  control: "10px"
  panel: "18px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
  section: "clamp(6rem, 11vw, 10rem)"
  gutter: "clamp(1.25rem, 4vw, 4rem)"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.surface-raised}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.brand-press}"
  button-secondary:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-on-deep:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "52px"
  panel:
    backgroundColor: "{colors.surface-raised}"
    rounded: "{rounded.panel}"
    padding: "28px"
  panel-mist:
    backgroundColor: "{colors.surface-tint}"
    rounded: "{rounded.panel}"
    padding: "28px"
  segmented:
    backgroundColor: "{colors.surface-tint}"
    textColor: "{colors.slate}"
    rounded: "{rounded.pill}"
    height: "48px"
  field:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "52px"
---

## Overview

A3 Signature Green keeps the structure, motion and 3D of A3 Corporate Signature and moves it into the corporate green on luminous grounds. The brand symbol is a **glass 3.0 ring**: thin, clear, refractive glass lit from behind, with energy streams that arrive as chaos and leave as ordered lines through it. Next to it, a typeset **"3."** in the display face. The page is a film in chapters: natural white and mint chapters for the hero, SavEnergy, services, audiences, process, value, partners and trust; deep green only for the offer comparison and the collaborators + close + footer. Chapters open through apertures (a light that grows out of the ring into the next scene).

Sequence (A3 Signature Green): hero ring on natural white (scroll flies the camera through the ring, its light becomes the SavEnergy opening) → SavEnergy (a physical bill turns to face you, is scanned, its rows lift and fly as data into charts, then an anonymised comparison on deep green, then the live console) → services as one particle body that morphs between five identities → audiences as two words → the original five-step process cycle → value → trust as one sentence of figures and one large quote → collaborators and close.

Brand continuity: the official logo is used unchanged in header and footer; its green survives only as **saving**.

## Colors

A3 Signature Green replaces the blue of Signature with the green of the official logo, refined to sit between technology and trust: deep, slightly cool greens, never fluorescent, never "eco".

**Single source of truth.** All colours live in `src/site/site.css` (`.site` block): primitives (`--green-950 … --green-50`, `--white-natural`), alpha channels (`--ink-rgb`, `--brand-rgb`, `--accent-rgb`, `--soft-rgb`, `--deep-rgb`), then semantic tokens (`--surface`, `--surface-tint`, `--surface-deep`, `--ink`, `--ink-soft`, `--ink-muted`, `--ink-faint`, `--brand`, `--brand-press`, `--accent`, `--accent-soft`, `--on-deep-2`). Legacy names used by older components (`--navy`, `--blue`, `--sky`, `--mist`…) are aliases of the semantic layer. WebGL and canvas read the same variables through `src/signature/visuals/tokens.ts`: the glass attenuation, backdrop light pool, graticule, energy streams, "3." mark, rim light and the service particles all follow the tokens.

- **Surface `#FAFCFB` (natural white) / Raised `#FFFFFF` / Tint `#EDF6F0` / Tint-2 `#DCEDE2`**: grounds. White and mint alternate between chapters so apertures still read on light.
- **Ink `#12382D`** (12.5:1 on surface): headings and text. **Ink-soft `#2B4A3F`** (9.5:1), **Ink-muted `#4A6359`** (6.3:1; 5.9:1 on tint). **Ink-faint `#6B8379`** (3.96:1) only for large or inactive display text.
- **Brand `#176B4D`**: primary buttons (white text 6.5:1), selected states, brand text (6.3:1), ordered energy. Press `#145A41`.
- **Accent `#38A879`**: fills, chart bars, energy pulses and particles; never body text on light. Labels on accent use `#0B241C`.
- **Accent-soft `#A8DFBD`**: light pools, glass tint, accent text on deep (8.6:1).
- **Deep `#12382D` / Deeper `#0B241C`**: reserved for the cinematic moments: SavEnergy's offer comparison, the "human attention" card, Collaborators + Close and the footer (≈15–20% of the page).
- **Simulation `#9A4F00` / on deep `#F5C77E`**: unchanged; every simulated or unverified element.

Luminosity: about 80% of the page is on white or mint. Light comes from materials (translucent glass tinted green, soft green light pools, subtle shadows tinted with ink) rather than from bloom; bloom is disabled on light grounds because it washes out the glass.

## Typography

Display: Anybody (variable, width axis) at weight 700, used condensed (58–100% width). Headings below the fold *widen* as they enter (font-stretch 58% → 90%); the process verbs and audience words use width as state (narrow = inactive, wide = active). Text: Geologica (variable; weight + SHRP axis), self-hosted. Geologica headlines at weight 600 with SHRP 60 (cut, assertive terminals), tight leading (0.98–1.04) and negative tracking that relaxes as size drops. Body at 400, 17px, 1.6 leading, measure 60–70ch. Martian Mono appears only for measured values (kWh, kW, €, steps of the scan) — never as a "tech" costume for labels.

No eyebrows or kickers above headings; no all-caps labels; headings carry their own weight. Headlines use `text-wrap: balance`, body `text-wrap: pretty`.

## Layout

Max content width 1320px with fluid gutters `clamp(1.25rem, 4vw, 4rem)`. Section rhythm `clamp(6rem, 11vw, 10rem)`, more space above a heading than below. Left-aligned editorial composition on a 12-column grid; asymmetric splits (7/5, 5/7) instead of centred stacks. Dense passages (SavEnergy, process) are followed by quiet ones (value, partners).

Responsive: 375 / 768 / 1024 / 1440. Pinned scroll narratives only from 1024px up; below, the same content plays as a sequence of short reveals. No horizontal scroll on phones.

## Elevation & Depth

Depth comes from the energy field and from layered planes, not from shadows on everything. Two shadows only: `shadow-1` for resting panels `0 1px 2px rgba(16,32,61,.06), 0 12px 28px -16px rgba(16,32,61,.22)` and `shadow-2` for floating instruments `0 40px 80px -40px rgba(16,32,61,.45)`. Translucent material (white 72% + blur 18px) only on the sticky header and the floating language/motion controls.

## Shapes

Controls 10px radius, panels 18px, pills (999px) only for segmented controls and chips. Lines are 1px hairlines in `line`. The graticule (10% grid, 1px) is the structural motif behind instruments and charts; it fades at its edges.

## Components

- **Hero ring (WebGL, three.js)**: MeshPhysicalMaterial glass torus (transmission, dispersion on high tier, clearcoat) green-tinted attenuation, on a natural-white backdrop with a mint light pool and faint green graticule; streams go from faint mint (chaos) to ink and brand green (order) with accent pulses; energy streams as tube shaders that order themselves over 2.4 s; cursor moves a point light; scroll flies the camera into the ring and its centre becomes a circular aperture into the SavEnergy title (match cut). Device tiers: high (dispersion, 11 streams), low (6 streams), off (static poster webp) for reduced motion, Save-Data, low memory and software GL.
- **Hero copy**: two-beat headline, subtitle, primary CTA "Analitza la meva factura" which opens the SavEnergy console directly; dock with the three SavEnergy modes from the first screen.
- **SavEnergy**: pinned 520vh scene on desktop (static sequence under 1024px or reduced motion): bill turns (rotateY −62° → 0), scanner sweeps, rows lift in Z, data points fly on curved paths into power / energy / period charts, then a comparison of 14 anonymised suppliers on navy. Every value is synthetic and carries the Simulació label; no savings figure is presented as real.
- **Services**: one Canvas2D particle body (1400 / 700 points) morphing between electricity (parallel flows), gas (flame plume), telecom (network), alarms (shield + sweep), insurance (balanced orbits); a name list drives it. No card grid.
- **Process**: the original A3 Corporate component (`src/site/home/Process.tsx` + its site.css styles), reused unchanged on white: headline and text left, five numbered steps, animated ring on the right with five numbered nodes and a centre label that follows the active step, scroll-synchronised. Only the colours change, through the tokens.
- **Audiences**: the words Particulars / Empreses are the switch (display face, width as state).
- **Trust**: figures in one editorial sentence, one large quote at a time with city buttons; while unverified, both carry the pending label.
- **Partners**: confirmed partners only; until then one sentence with the pending label.
- **Forms**: labelled fields, inline errors, explicit consent, UTM and referral capture; submit goes through a local simulated lead adapter (no CRM connection).

## Do's and Don'ts

- Do let one element lead each section; keep the rest quiet.
- Do label every simulation and every unverified figure.
- Do keep motion tied to meaning (reading, comparing, cycling); one orchestrated entrance per section.
- Don't use stock photos, bulbs, hard hats, glossy 3D icons, or icon-card grids.
- Don't use glow halos, particle confetti or floating blobs.
- Don't invent partners, certifications, savings, clients or testimonials.
- Don't animate on keyboard actions or high-frequency controls; never `transition: all`.
