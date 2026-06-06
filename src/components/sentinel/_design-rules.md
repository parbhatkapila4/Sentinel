# Sentinel design system - internal rules

These rules are enforced by the `no-restricted-syntax` ESLint rule scoped to
`src/components/sentinel/**`.

## Banned utilities (will fail lint)

- `text-white`, `text-black`
- `bg-white`, `bg-black`
- `bg-neutral-*`, `text-neutral-*`
- `bg-gray-*`, `text-gray-*`
- `text-red-*`, `text-blue-*`, `text-emerald-*`, `text-amber-*`, `text-green-*`, `text-purple-*`
- `border-white/*`, `bg-white/*` (any opacity)

## Required substitutions

| Don't write | Do write |
| --- | --- |
| `text-white` | `style={{ color: 'var(--cream)' }}` |
| `bg-black` | `style={{ background: 'var(--ink)' }}` |
| `text-red-500` | `style={{ color: 'var(--wine)' }}` for risk, `var(--signal)` for accent |
| `text-emerald-400` | `style={{ color: 'var(--ivy)' }}` |
| `text-amber-500` | `style={{ color: 'var(--copper)' }}` |
| `border-white/10` | `style={{ borderColor: 'var(--rule)' }}` |

## Display headings

Every display heading at 60px+ must:

1. Use `var(--font-serif)` (Instrument Serif).
2. Contain at least one italic word in `var(--signal)` (sienna).
3. Use `tabular-nums` if it shows a number.

## Mono labels

All small uppercase labels (10–11px) must:

1. Use `var(--font-mono-jb)` (JetBrains Mono).
2. Have `letter-spacing` between `0.08em` and `0.2em`.
3. Use `var(--cream-3)` or `var(--cream-2)` - never pure white.

## Cream is load-bearing

Primary text is `#F5EDD6`, never `#FFFFFF`. If you find yourself reaching for
`text-white`, you are off the design.
