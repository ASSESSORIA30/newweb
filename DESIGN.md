---
name: Assessoria 3.0 — A3 Corporate Signature
description: Energy advisory with people behind the technology. A glass 3.0 ring lit by ordered energy, night chapters on #050A1C alternating with luminous white editorial chapters.
colors:
  canvas: "#FFFFFF"
  mist: "#F0F4FA"
  mist-deep: "#E3EAF6"
  navy: "#10203D"
  navy-deep: "#0A1630"
  night: "#050A1C"
  ink-2: "#2C3D5C"
  slate: "#4E5D7A"
  blue: "#2458FF"
  blue-text: "#1C4BE0"
  blue-press: "#1A45D6"
  sky: "#84B9FF"
  sky-soft: "#C9DEFF"
  saving: "#00B050"
  saving-text: "#08803E"
  simulation: "#9A4F00"
  simulation-on-navy: "#F5C77E"
  line: "rgba(16, 32, 61, 0.12)"
  line-on-navy: "rgba(201, 222, 255, 0.16)"
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
    backgroundColor: "{colors.blue}"
    textColor: "{colors.canvas}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.blue-press}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "52px"
  button-on-navy:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    height: "52px"
  panel:
    backgroundColor: "{colors.canvas}"
    rounded: "{rounded.panel}"
    padding: "28px"
  panel-mist:
    backgroundColor: "{colors.mist}"
    rounded: "{rounded.panel}"
    padding: "28px"
  segmented:
    backgroundColor: "{colors.mist}"
    textColor: "{colors.slate}"
    rounded: "{rounded.pill}"
    height: "48px"
  field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.navy}"
    rounded: "{rounded.control}"
    height: "52px"
---

## Overview

A3 Corporate Signature is the art-directed evolution of A3 Corporate. The brand symbol is a **glass 3.0 ring**: thin, clear, refractive glass lit from behind, with energy streams that arrive as chaos and leave as ordered lines through it. Next to it, a typeset **"3."** in the display face. The page is a film in chapters: night chapters (#050A1C) for the hero, services, process and close; luminous white editorial chapters for audiences, trust and partners. Chapters open through apertures (a light that grows out of the ring into the next scene).

Sequence: hero ring (scroll flies the camera through the ring, its light becomes the SavEnergy opening) → SavEnergy (a physical bill turns to face you, is scanned, its rows lift and fly as data into charts, then an anonymised comparison on navy, then the live console) → services as one particle body that morphs between five identities → audiences as two words → process with the ring returning as the yearly cycle → value → trust as one sentence of figures and one large quote → collaborators and close.

Brand continuity: the official logo is used unchanged in header and footer; its green survives only as **saving**.

## Colors

- **Canvas `#FFFFFF` / Mist `#F0F4FA` / Mist deep `#E3EAF6`** — grounds. White is the default; mist separates bands; mist-deep for pressed or selected surfaces.
- **Navy `#10203D` / Navy deep `#0A1630`** — ink for all text on light grounds and the ground of the two dark chapters (collaborators, close + footer).
- **Ink-2 `#2C3D5C`, Slate `#4E5D7A`** — secondary and tertiary text. Slate is the lightest text allowed on white (6.6:1).
- **Blue `#2458FF`** — the one action colour: primary buttons, the energy trace, focus rings, selected states. As text use **Blue-text `#1C4BE0`** (6.7:1 on white, 5.5:1 on mist-deep). Hover/press **`#1A45D6`**.
- **Sky `#84B9FF`, Sky-soft `#C9DEFF`** — secondary energy (dim traces, chart fills) and accent text on navy.
- **Saving `#00B050` (fills) / Saving-text `#08803E` (text, 4.9:1)** — from the logo; only for savings and positive outcomes.
- **Simulation `#9A4F00` / on navy `#F5C77E`** — the label colour for every simulated or pending-verification element. Never decorative.

Every text pair used ships at WCAG AA or better. No gradients as decoration: the only gradients are light falloff on the energy field and data fills.

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

- **Hero ring (WebGL, three.js)**: MeshPhysicalMaterial glass torus (transmission, dispersion on high tier, clearcoat) on a navy backdrop with a radial backlight; energy streams as tube shaders that order themselves over 2.4 s; cursor moves a point light; scroll flies the camera into the ring and its centre becomes a circular aperture into the SavEnergy title (match cut). Device tiers: high (bloom, dispersion, 11 streams), low (6 streams, no bloom), off (static poster webp) for reduced motion, Save-Data, low memory and software GL.
- **Hero copy**: two-beat headline, subtitle, primary CTA "Analitza la meva factura" which opens the SavEnergy console directly; dock with the three SavEnergy modes from the first screen.
- **SavEnergy**: pinned 520vh scene on desktop (static sequence under 1024px or reduced motion): bill turns (rotateY −62° → 0), scanner sweeps, rows lift in Z, data points fly on curved paths into power / energy / period charts, then a comparison of 14 anonymised suppliers on navy. Every value is synthetic and carries the Simulació label; no savings figure is presented as real.
- **Services**: one Canvas2D particle body (1400 / 700 points) morphing between electricity (parallel flows), gas (flame plume), telecom (network), alarms (shield + sweep), insurance (balanced orbits); a name list drives it. No card grid.
- **Process**: night chapter; the ring image returns and rotates with scroll as the yearly cycle; five verbs replace each other in the centre with a mask wipe and width change; the step list expands only the active step.
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
