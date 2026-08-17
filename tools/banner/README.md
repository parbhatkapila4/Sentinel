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

Minimal monochrome. `header.svg` is LIGHT: white card (`#FFFFFF`→`#FAFAF9`), near-black
`#0A0A0A` type and gate mark, grays `#7C7C7A`/`#8A8A88`, light-gray `#D0D0CE` blocked
flows, 1px border at `rgba(0,0,0,0.08)`. `architecture.svg` is DARK: flat true-neutral
black ground (`#0D0D0D`→`#090909`), 1px border at `rgba(255,255,255,0.08)`. NO textures — no
dot grids, no frames, no corner ticks, no title blocks, no warm/amber tones (a previous
drafting-sheet version with those was rejected as looking cheap). Type carries the design:
big Space Grotesk wordmark in `#F5F5F3`, grays `#8A8A88` / `#71716F` / `#5E5E5C` for tiers,
JetBrains Mono for technical labels. White (`#F5F5F3`) is the only accent — it marks the
gate and the admitted/persisted path; the single exception is the dropped ✕ in `#C25E52`.
Flows: pre-gate `#3E3E3C` @ 1.5px, admitted post-gate `#E8E8E6`; dropped flows terminate ON
the wall. Keep annotation type ≥11px (the SVG is shown at 74% width on GitHub).

Note: the banners embed product claims as outlined text (e.g. `INGEST READ-ONLY`,
`FAIL-CLOSED · PII-BLIND`, the stack list). The claim-drift tests cannot grep images —
when claims change, update the specs here too.
