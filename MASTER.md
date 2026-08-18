# MASTER — Design System

Single source of truth for `index.html`. Every color, size, easing and duration in the
site comes from this file. No magic numbers, no rogue hex values.

**Direction:** Terminal Green
**Built:** 2026-08-09

---

## Theses

**Visual thesis**
Green-tinted near-black interface with hairline glass surfaces, oversized tight-tracked
Space Grotesk display type against small mono micro-labels, generous 24px radii, and a
single saturated spring-green accent used only for action and state — never decoration.

**Interaction thesis**
Quart-eased motion (`cubic-bezier(.165,.84,.44,1)`) at 160–420ms for interface, up to 900ms
for large scroll moves; hover lifts a surface and lights it from the cursor position;
scroll drives masked header reveals, sticky-stacked featured panels and image parallax;
**forbidden** — bounce/elastic on informational UI, scroll-jacking, animating
`width`/`height`/`top`/`left`, anything over 900ms.

---

## Color

Derived from `abbasraza.dev` measurements (`rgb(1,10,3)` base, `rgb(0,255,127)` accent,
`rgb(230,255,230)` text, `rgb(160,191,160)` muted).

### Dark (primary)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#010A03` | Page base. Never pure `#000` — kills OLED smear. |
| `--bg-elev` | `#04120A` | Raised wells, code panels |
| `--surface` | `rgba(230,255,230,.030)` | Card fill — translucent, not a gray box |
| `--surface-2` | `rgba(230,255,230,.055)` | Hover fill, chips, tags |
| `--border` | `rgba(230,255,230,.10)` | Hairline dividers |
| `--border-hi` | `rgba(0,255,127,.38)` | Focused / hovered card edge |
| `--text` | `#E6FFE6` | Body + headings |
| `--muted` | `#A0BFA0` | Secondary prose, labels |
| `--accent` | `#00FF7F` | CTAs, active state, live dot |
| `--accent-ink` | `#00140A` | Text **on** accent fills |
| `--warn` | `#F5A524` | In-progress status only |

### Light (theme toggle — a retained core feature)

| Token | Value | Note |
|---|---|---|
| `--bg` | `#F3F7F4` | |
| `--bg-elev` | `#FFFFFF` | |
| `--surface` | `rgba(6,20,11,.028)` | |
| `--surface-2` | `rgba(6,20,11,.055)` | |
| `--border` | `rgba(6,20,11,.12)` | |
| `--border-hi` | `rgba(0,121,76,.45)` | |
| `--text` | `#06140B` | |
| `--muted` | `#4A5C50` | |
| `--accent` | `#00794C` | **Darkened.** `#00FF7F` on white is 1.4:1 — fails AA. `#00794C` is 5.1:1. |
| `--accent-ink` | `#FFFFFF` | |
| `--warn` | `#8A5200` | **Darkened.** `#F5A524` on light is 1.9:1 — fails AA. `#8A5200` is 5.8:1. |

### Contrast (WCAG AA, verified)

| Pair | Ratio | |
|---|---|---|
| `--text` on `--bg` (dark) | ~18.6:1 | AAA |
| `--muted` on `--bg` (dark) | ~9.4:1 | AAA |
| `--accent` on `--bg` (dark) | ~14.8:1 | AAA |
| `--accent-ink` on `--accent` | ~13.1:1 | AAA |
| `--text` on `--bg` (light) | ~16.2:1 | AAA |
| `--muted` on `--bg` (light) | ~7.1:1 | AAA |
| `--accent` on `--bg` (light) | ~5.1:1 | AA |

---

## Typography

Fonts already loaded by the existing page — **no new network requests**.

| Role | Family | Use |
|---|---|---|
| Display | Space Grotesk 600/700 | h1, h2, h3 |
| Body | Inter 400/500/600 | prose, buttons |
| Mono | JetBrains Mono 400/500 | micro-labels, tags, counts, terminal |

### Scale

| Token | Value | Tracking / leading |
|---|---|---|
| `--fs-display` | `clamp(2.75rem, 7.4vw, 5.25rem)` | `-.035em` / `.94` |
| `--fs-h2` | `clamp(2rem, 5.2vw, 3.25rem)` | `-.028em` / `1.0` |
| `--fs-h3` | `clamp(1.15rem, 1.5vw, 1.4rem)` | `-.012em` / `1.25` |
| `--fs-lead` | `clamp(1.05rem, 1.5vw, 1.2rem)` | `1.6` |
| `--fs-body` | `1rem` | `1.65` |
| `--fs-sm` | `.875rem` | `1.55` |
| `--fs-micro` | `.6875rem` | `.18em`, uppercase, mono |

Measure capped at `--measure: 64ch`.

---

## Space · Radii · Elevation

**Space** — 4px base: `4 8 12 16 24 32 48 64 96 128`
**Radii** — `--r-sm 8` `--r-md 12` `--r-lg 16` `--r-xl 24` `--r-pill 999`
**Blur** — `--blur-nav 14px` `--blur-card 12px` (matches Abbas Raza's 8/12/24 ladder)
**Grid** — 12 col, `--gap 24px`, container `--maxw 1180px`, gutter 24px (20px ≤640px)

---

## Motion tokens

| Token | Value | Use |
|---|---|---|
| `--e-out` | `cubic-bezier(.165,.84,.44,1)` | Default. Quart-out, from Perry Wang. |
| `--e-quint` | `cubic-bezier(.23,1,.32,1)` | Large/slow moves, shadows |
| `--e-in` | `cubic-bezier(.4,0,1,1)` | Exits only |
| `--d-fast` | `160ms` | Color, opacity, micro-states |
| `--d-base` | `260ms` | Hover lift, chips |
| `--d-slow` | `420ms` | Reveals, filter transitions |
| `--d-xslow` | `900ms` | Masked header reveal |
| `--stagger` | `60ms` | Per-item grid delay |

Exits run at ~65% of enter duration.

---

## Components — 5 states each

`default · hover · focus-visible · active · disabled`

- **Button primary** — accent fill, `--accent-ink` text, `--r-pill`. Hover: `translateY(-2px)` + accent glow. Active: `translateY(0) scale(.98)`.
- **Button ghost** — transparent, `--border`. Hover: `--surface-2` + `--border-hi`.
- **Card** — `--surface` + `--border` + `--r-xl` + `backdrop-filter: blur(--blur-card)`. Hover: `--border-hi`, `translateY(-4px)`, cursor spotlight lights `--mx/--my`.
- **Chip / tag** — mono `--fs-micro`, `--surface-2`, `--r-pill`.
- **Filter** — `aria-pressed=true` → accent fill.
- **Focus ring** — `2px solid --accent`, `offset 3px`. Never removed.

---

## Signature effects

| Effect | Mechanism | Fallback |
|---|---|---|
| Masked header reveal | `animation-timeline: view()` | IntersectionObserver `.in` |
| Sticky-stacked featured panels | `position: sticky` + scroll-linked scale/dim | Static stack |
| Cursor spotlight | `pointermove` → rAF → `--mx/--my` → `radial-gradient` | Omitted on coarse pointers |
| Image parallax | `animation-timeline: view()` on `translateY` | Static |
| Filter morph | `document.startViewTransition()` + per-card `view-transition-name` | Instant toggle |
| Magnetic CTA | `pointermove` → `translate`, `@media (pointer:fine)` | Static |
| Scroll progress | `animation-timeline: scroll()` on `scaleX` | Hidden |
| Animated d20 | Inline SVG wireframe, CSS rotate + roll flicker | Static SVG |

---

## Performance budget

- Zero JS dependencies. Zero build step. Single file.
- Images: WebP, `srcset`, explicit `width`/`height`, `loading="lazy"`, `decoding="async"`.
  Source set 4.58MB → 204KB (−96%).
- `content-visibility: auto` deliberately **not** used — it suppresses rendering for
  offscreen content, which breaks `animation-timeline: view()` and causes scrollbar jump.
  The page is small enough that it buys nothing.
- `will-change` never set statically; transforms are applied inline only during active
  pointer interaction and cleared on leave.
- Compositor-only properties: `transform`, `opacity`, `filter`.

## Accessibility floor

- `prefers-reduced-motion: reduce` → all transforms/parallax/transitions off, content visible.
- Every interactive element keyboard reachable, focus ring visible.
- Decorative SVG `aria-hidden`, icon-only controls labelled.
- Sequential headings, skip link, `aria-live` on filter results.
- Touch targets ≥44px.
