# Banner generator

`header.svg` and `architecture.svg` at the repo root are **generated artifacts**: every
piece of text in them is converted to vector outlines (Space Grotesk for display type,
JetBrains Mono for labels) so the banners render pixel-identically on every platform,
instead of falling back to whatever system font a GitHub visitor happens to have.
Do not hand-edit the root SVGs — edit the sources here and regenerate.

## Layout

- `header-template.svg` / `arch-template.svg` — the designs, with `@@id@@` tokens where
  outlined text runs are injected. Geometry, colors, and animation live here.
- `spec-header.js` / `spec-arch.js` — the text runs: string, font, size, tracking, anchor.
- `gen.js` — outlines each run with opentype.js and assembles the final SVG.

## One-time setup (in this directory)

```bash
npm install
mkdir -p fonts
curl -L -o fonts/JetBrainsMono-Regular.ttf https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf
curl -L -o fonts/JetBrainsMono-Medium.ttf  https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Medium.ttf
```

Both font families are OFL-licensed; embedding their outlines in the SVGs is permitted.

## Regenerate

```bash
node gen.js header   # -> ../../header.svg
node gen.js arch     # -> ../../architecture.svg
```

## Design system (keep it consistent)

Drafting-sheet aesthetic: flat near-black ground (`#0C0B09`→`#0A0907`), hairline frame at
8% warm white with amber corner ticks, 24px dot grid at 5%, title-block footer strip.
One amber accent family (`#E2A24E` / `#D9A85C` / `#EFC489`) reserved for the gate and what
passes it; desaturated brick `#C4695A` only for the dropped ✕. No glows, no gradients on
strokes, no shields. Wall = `#625948` @ 2px with an aperture bracketed by amber jambs;
dropped flows terminate ON the wall. Keep all annotation type ≥11px (SVG is shown at 74%
on GitHub) and keep right-side annotations on the shared right datum (x=1148 header).

Note: the banners embed product claims as outlined text (e.g. `INGEST READ-ONLY`,
`FAIL-CLOSED · PII-BLIND`, the stack list). The claim-drift tests cannot grep images —
when claims change, update the specs here too.
