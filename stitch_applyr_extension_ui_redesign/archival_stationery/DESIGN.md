---
name: Archival Stationery
colors:
  surface: '#faf9fb'
  surface-dim: '#dbd9dc'
  surface-bright: '#faf9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f5'
  surface-container: '#efedf0'
  surface-container-high: '#e9e8ea'
  surface-container-highest: '#e3e2e4'
  on-surface: '#1b1c1e'
  on-surface-variant: '#404943'
  inverse-surface: '#2f3032'
  inverse-on-surface: '#f2f0f3'
  outline: '#707973'
  outline-variant: '#bfc9c1'
  surface-tint: '#2c694e'
  primary: '#0f5238'
  on-primary: '#ffffff'
  primary-container: '#2d6a4f'
  on-primary-container: '#a8e7c5'
  inverse-primary: '#95d4b3'
  secondary: '#a23e18'
  on-secondary: '#ffffff'
  secondary-container: '#fe8357'
  on-secondary-container: '#6f2000'
  tertiary: '#783300'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d4500'
  on-tertiary-container: '#ffd0b8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b1f0ce'
  primary-fixed-dim: '#95d4b3'
  on-primary-fixed: '#002114'
  on-primary-fixed-variant: '#0e5138'
  secondary-fixed: '#ffdbcf'
  secondary-fixed-dim: '#ffb59c'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#822801'
  tertiary-fixed: '#ffdbca'
  tertiary-fixed-dim: '#ffb68e'
  on-tertiary-fixed: '#331200'
  on-tertiary-fixed-variant: '#763300'
  background: '#faf9fb'
  on-background: '#1b1c1e'
  surface-variant: '#e3e2e4'
typography:
  headline-lg:
    fontFamily: Newsreader
    fontSize: 30px
    fontWeight: '500'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Manrope
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Manrope
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Manrope
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-sm: 0.75rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system draws direct inspiration from archival stationery, literary publishing, and precision administrative tools. Designed for a local-first browser extension handling sensitive professional dossiers, the interface rejects cold corporate SaaS conventions and hyper-saturated novelty in favor of deliberate editorial dignity.

The design philosophy unites:
- **Archival Tactility:** Grounded in unbleached paper stocks, deckled structure, and crisp hairline ruled dividers that evoke classic ledger sheets and binder folios.
- **Scholarly Authority:** Driven by literary serif headlines balanced against clean, humanist geometric sans-serif body typography and technical monospaced indices.
- **Local-First Reassurance:** A tangible, grounded aesthetic communicating permanence, privacy, and deliberate ownership over personal career data—absent of fleeting gradients, synthetic glassmorphism, or aggressive neon states.

## Colors

The color palette is derived from traditional printing inks, natural binder boards, and classic archival labeling materials.

### Color Tokens & Roles
- **Canvas Base (`#F9F8F6`):** Natural warm paper tint applied to primary window backdrops and extension popover frames.
- **Canvas Muted (`#F4F2EB`):** Slightly deeper parchment wash reserved for inset sections, table headers, sticky utility bars, and nested dossiers.
- **Surface Elevation (`#FFFFFF`):** Pure archival rag vellum applied to discrete cards, action panels, and input fields to surface them above the parchment canvas.
- **Primary Ink Accent (`#2D6A4F`):** Vintage forest green. Signifies successful autofill sync, verified local-first storage, active switches, and primary confirmation triggers.
- **Secondary Ink Accent (`#C85A32`):** Warm terracotta. Denotes destructive actions, critical sync mismatches, and signature highlights.
- **Review / Alert (`#B45309`):** Warm amber ink used for fields needing manual applicant verification, low-confidence heuristic matches, or permission prompts.
- **Ink Primary (`#1C1D1F`):** Deep carbon charcoal for headlines, active inputs, and primary editorial text.
- **Ink Secondary (`#2C2E33`):** Subdued carbon for body narrative, column titles, and field labels.
- **Ink Muted (`#706E68`):** Muted letterpress gray for metadata, hotkey hints, and inactive states.
- **Hairline Rule (`#E4E2DC`):** Delicate 1px dividers evoking ledger rules.
- **Structural Border (`#D6D3CB`):** Perimeter borders for cards, inputs, and popover boundaries.

## Typography

The typographic hierarchy juxtaposes literary serif craft with operational legibility.

- **Headlines (`Newsreader`):** Optical sizes and deliberate editorial proportions give section headers and status overviews the gravity of printed journals. Headings must avoid bold weights; weight 500 maintains clean letterforms without filling ink traps.
- **Body & Controls (`Manrope`):** A modern, geometric-humanist sans offering exceptional clarity at small extension viewport scales (12px–15px). Used for applicant records, autofill field mappings, setting controls, and contextual instructions.
- **Technical Annotations (`JetBrains Mono`):** Applied strictly to field tags, selector matches, regex parsing rules, and SQLite query status indications.

## Layout & Spacing

The layout model adapts between a constrained 400px extension browser popup, a side-panel drawer (480px–640px), and a full-page local dashboard.

### Rhythm & Alignment
- Spacing follows an 8pt architectural grid with 4pt sub-steps for dense data listings (`space-xs: 4px`, `space-sm: 8px`, `space-md: 12px`, `space-lg: 20px`, `space-xl: 28px`).
- Form elements and metadata clusters utilize tight, uniform row heights reminiscent of index cards and catalog drawers.
- Viewports enforce a fixed structural padding: `margin-sm` (12px) in popup views and `margin` (20px) in full-width manager interfaces.

## Elevation & Depth

This system intentionally avoids deep drop shadows, dramatic blurs, and neon glow effects. Depth is expressed purely through surface layering and physical ink lines:

- **Level 0 (Parchment Foundation):** The base `#F9F8F6` background. Flat, textured by color warmth.
- **Level 1 (Stationery Panels & Cards):** Crisp `#FFFFFF` surfaces bounded by a solid 1px `#D6D3CB` structural border. A single ultra-diffused resting shadow anchors the element: `0 1px 3px rgba(28, 29, 31, 0.04)`.
- **Level 2 (Active Focus & Overlays):** Modal sheets, active autofill tooltips, and floating profile pickers use a precise dual line and soft ground shadow: `0 4px 12px rgba(28, 29, 31, 0.08)`, bounded by a `#D6D3CB` border.
- **Dividers & Rules:** Section breaks rely on crisp 1px `#E4E2DC` hairlines instead of whitespace gulfs, keeping information density disciplined and catalog-like.

## Shapes

The shape system adopts a reserved, lightly softened geometry (`roundedness: 1`):
- **Base Components (Inputs, Buttons, Badges):** `4px` (`0.25rem`) corner radius. Maintains crisp architectural geometry while eliminating harsh needle points.
- **Cards & Dialog Containers:** `8px` (`0.5rem`, `rounded-lg`). Provides subtle container separation without turning playful or bubbly.
- **Pills and Full Radii:** Forbidden for standard structural buttons or cards. Retained strictly for discrete circular iconography badges and status pips.

## Components

### Buttons
- **Primary Action:** Solid vintage forest green background (`#2D6A4F`), crisp white text (`#FFFFFF`), `4px` border radius, `0.75rem` vertical by `1rem` horizontal padding. Hover shifts to `#23543E` with an immediate, non-spring transition (120ms ease-out).
- **Secondary Action:** White vellum background (`#FFFFFF`), 1px structural border (`#D6D3CB`), text in `#1C1D1F`. Hover transitions to `#F4F2EB` background.
- **Tertiary / Destructive:** Terracotta text (`#C85A32`) with transparent background; shifts to a faint terracotta wash (`rgba(200, 90, 50, 0.06)`) on active hover.

### Form Inputs & Autofill Fields
- Built on a crisp `#FFFFFF` surface with a 1px `#D6D3CB` border and a `4px` radius.
- Active/Focus State: Border immediately sharpens to `#2D6A4F` paired with an offset 1px focus hairline—never an expansive diffuse glow.
- Field labels sit above in `label-sm` Manrope uppercase tracking (`#706E68`).
- Detection tags sit inline at the right edge in `code-sm` JetBrains Mono, styled as small ruled pills (`#F4F2EB` with `#E4E2DC` borders).

### Cards & Dossier Panels
- White background (`#FFFFFF`) with 1px `#D6D3CB` perimeter borders.
- Headers are divided from card content using a continuous 1px `#E4E2DC` hairline separator.
- Sub-cards (such as experience nodes or education records) adopt the muted parchment background (`#F4F2EB`) with an interior border.

### Status Indicators & Badges
- **Verified / Synced:** Forest green fill (`#2D6A4F`), white text, or pale green tint (`#EAF2ED`) with `#2D6A4F` text.
- **Needs Review:** Warm amber tint (`#FEF3C7`) with dark amber text (`#B45309`) and a 1px `#FDE68A` hairline border.
- **Unmapped / Warning:** Terracotta tint (`#FBEBE6`) with `#C85A32` text.

### Checkboxes & Radios
- Square (`4px` radius for checkboxes; circular for radio options) with a `#D6D3CB` 1.5px boundary on white vellum.
- Checked state fills with `#2D6A4F` showing a clean geometric white checkmark, giving the feel of a meticulous ink stamp.