# Design — Budget Master

A locked design system for this financial management app, engineered with the Hallmark anti-AI-slop standard. Every page and component reads this system.

## Genre
`modern-minimal` (Linear / Stripe / ElevenLabs school: clean precision canvas, deep graphite/slate dark mode, pure crisp paper light mode, single cobalt/indigo signal accent, tight display tracking, tabular financial figures, zero gratuitous glassmorphism or generic gradient text).

## Macrostructure Family
- **App Dashboard & Views**: `Workbench` (05-workbench) — unified top command strip, dense structured ledger, crisp micro-borders, tactile active states, responsive multi-column layout.
- **Onboarding & Auth**: `Statement Tour` — deliberate 3-stage visual architecture, honest messaging, pill pagination, focused single-action card.

## Theme & Tokens (OKLCH)

### Light Theme
- `--color-paper`: `oklch(99% 0.002 260)` (pure clean canvas)
- `--color-paper-2`: `oklch(96% 0.005 260)` (card surface)
- `--color-paper-3`: `oklch(93% 0.008 260)` (hover / elevated)
- `--color-ink`: `oklch(15% 0.015 260)` (deep graphite primary text)
- `--color-ink-2`: `oklch(45% 0.012 260)` (secondary label text)
- `--color-rule`: `oklch(88% 0.006 260)` (hairline structural border)
- `--color-accent`: `oklch(52% 0.22 265)` (electric cobalt signal)
- `--color-accent-ink`: `oklch(99% 0 0)` (contrast text on accent)
- `--color-focus`: `oklch(58% 0.20 265)` (focus ring)
- `--color-success`: `oklch(62% 0.17 155)` (positive income / savings)
- `--color-danger`: `oklch(58% 0.22 25)` (expense / alert)

### Dark Theme
- `--color-paper`: `oklch(12% 0.015 260)` (obsidian dark canvas)
- `--color-paper-2`: `oklch(16% 0.018 260)` (deep card background)
- `--color-paper-3`: `oklch(22% 0.022 260)` (elevated control surface)
- `--color-ink`: `oklch(96% 0.005 260)` (bright white text)
- `--color-ink-2`: `oklch(68% 0.012 260)` (muted secondary text)
- `--color-rule`: `oklch(24% 0.015 260)` (dark crisp border)
- `--color-accent`: `oklch(64% 0.20 265)` (vibrant cobalt signal)
- `--color-accent-ink`: `oklch(99% 0 0)`
- `--color-focus`: `oklch(68% 0.18 265)`
- `--color-success`: `oklch(70% 0.16 155)`
- `--color-danger`: `oklch(65% 0.20 25)`

## Typography
- **Display Face**: `Inter`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif` (weight 700/800, tracking `-0.03em`, strictly roman)
- **Persian Typography**: `Vazirmatn`, `system-ui`, `sans-serif` (weights 400, 600, 700, 800)
- **Body Face**: `Inter`, `Vazirmatn`, `sans-serif` (weight 400/500, letter-spacing `-0.01em`)
- **Financial Digits**: `font-variant-numeric: tabular-nums` (strictly aligned numbers)

## Spacing & Geometry
- **4-pt Spacing Scale**: `--space-2xs: 4px`, `--space-xs: 8px`, `--space-sm: 12px`, `--space-md: 16px`, `--space-lg: 24px`, `--space-xl: 32px`
- **Border Radii**: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-pill: 9999px`

## Microinteractions & 8-State Feedback
- **Transitions**: `cubic-bezier(0.16, 1, 0.3, 1)` with `--dur-short: 180ms`
- **Interactive States**: default, hover, focus-visible (`2px solid var(--color-focus)`), active (`scale(0.98)`), disabled, loading.
- **CTA Voice**:
  - Primary CTA: Cobalt pill with white text, crisp shadow, no fuzzy gradient.
  - Secondary CTA: Paper-2 surface with hairline border (`var(--color-rule)`).

## What All Views Share
- Unified header with live database ping, workspace dropdown, and month navigator.
- Precise alignment, hairline borders instead of thick fuzzy shadows.
- High data readability with currency in **DKK (kr.)**.
