---
name: Assessoria 3.0 — A3 Corporate
description: Energy advisory with people behind the technology. Luminous white grounds, corporate blue, deep navy, one measured energy field.
colors:
  canvas: "#FFFFFF"
  mist: "#F0F4FA"
  mist-deep: "#E3EAF6"
  navy: "#10203D"
  navy-deep: "#0A1630"
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
    fontFamily: "Geologica Variable, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6.2vw, 5.75rem)"
    fontWeight: 600
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

A3 Corporate is the definitive identity for the new Assessoria 3.0 website. It grows out of proposal A ("Energy Intelligence"): the bill is a signal and the advisory reads it. The instrument language of A (a measured graticule, a single energy trace, readouts) is kept, but moved onto luminous white grounds with corporate blue and deep navy so the site reads as a solid company first and a technology second.

The page is a narrative, not a catalogue: an energy field that settles into a clean trace, a bill that is read line by line, services as an editorial index, a five-step cycle that closes on itself (we keep following the client), and a calm commercial close. People stay visible: offices, phones, WhatsApp and a named path to "talk to an advisor" sit next to every technical promise.

Brand continuity: the official logo (green round mark with the heart-handshake, "A" and "3.0") is used unchanged in the header and footer. Its green survives as one semantic colour only: **saving** (positive results, money kept). Everything else is blue and navy.

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

One family, Geologica (variable; weight + SHRP axis), self-hosted. Display and headlines at weight 600 with SHRP 60 (cut, assertive terminals), tight leading (0.98–1.04) and negative tracking that relaxes as size drops. Body at 400, 17px, 1.6 leading, measure 60–70ch. Martian Mono appears only for measured values (kWh, kW, €, steps of the scan) — never as a "tech" costume for labels.

No eyebrows or kickers above headings; no all-caps labels; headings carry their own weight. Headlines use `text-wrap: balance`, body `text-wrap: pretty`.

## Layout

Max content width 1320px with fluid gutters `clamp(1.25rem, 4vw, 4rem)`. Section rhythm `clamp(6rem, 11vw, 10rem)`, more space above a heading than below. Left-aligned editorial composition on a 12-column grid; asymmetric splits (7/5, 5/7) instead of centred stacks. Dense passages (SavEnergy, process) are followed by quiet ones (value, partners).

Responsive: 375 / 768 / 1024 / 1440. Pinned scroll narratives only from 1024px up; below, the same content plays as a sequence of short reveals. No horizontal scroll on phones.

## Elevation & Depth

Depth comes from the energy field and from layered planes, not from shadows on everything. Two shadows only: `shadow-1` for resting panels `0 1px 2px rgba(16,32,61,.06), 0 12px 28px -16px rgba(16,32,61,.22)` and `shadow-2` for floating instruments `0 40px 80px -40px rgba(16,32,61,.45)`. Translucent material (white 72% + blur 18px) only on the sticky header and the floating language/motion controls.

## Shapes

Controls 10px radius, panels 18px, pills (999px) only for segmented controls and chips. Lines are 1px hairlines in `line`. The graticule (10% grid, 1px) is the structural motif behind instruments and charts; it fades at its edges.

## Components

- **Buttons**: primary blue / secondary white with hairline / on-navy white. Height 52px, press `scale(0.97)` 160ms ease-out, hover colour 200ms, gated to fine pointers.
- **Energy field (hero)**: Three.js line field, normal blending on white; noise settles into a locked trace in 2.4s; dollies with scroll; paused off-screen, on hidden tabs and via the "Pause animation" control; static frame under reduced motion; not loaded on Save-Data or very low-power devices.
- **SavEnergy instrument**: three modes (upload bill / estimate without bill / talk to an advisor) as a segmented control; desktop plays a pinned, scroll-scrubbed scan that identifies concepts on a sample bill and flags opportunities. Every simulated value carries the simulation label.
- **Services index**: large typographic rows; the active row drives a sticky, per-service generative visual (waveform, flow, pulse, radar, shield arcs).
- **Audience switch**: Particulars / Empreses segmented control with a sliding thumb (260ms ease-in-out) swapping two compositions.
- **Process cycle**: five nodes on a ring; scroll advances the trace around it and returns to the start.
- **Evidence & testimonials**: rendered only from data flagged `verified`; unverified data shows with the pending-verification label.
- **Forms**: labelled fields, inline errors, explicit consent, UTM and referral capture; submit goes through a lead adapter that is a local simulation until the CRM integration is authorised.

## Do's and Don'ts

- Do let one element lead each section; keep the rest quiet.
- Do label every simulation and every unverified figure.
- Do keep motion tied to meaning (reading, comparing, cycling); one orchestrated entrance per section.
- Don't use stock photos, bulbs, hard hats, glossy 3D icons, or icon-card grids.
- Don't use glow halos, particle confetti or floating blobs.
- Don't invent partners, certifications, savings, clients or testimonials.
- Don't animate on keyboard actions or high-frequency controls; never `transition: all`.
