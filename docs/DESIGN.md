# Design system: Pennant

The tokens live in `assets/css/site.css` (CSS variables) and `assets/js/tailwind.config.js` (which maps Tailwind color names onto those variables).
This file explains the choices so future edits stay consistent.

## Idea

The layout follows shadcn/ui: zinc neutrals, hairline borders, quiet cards and small mono labels. The color and the one bold element come from home.
The accent is Nepal's crimson, the focus and outline color is the flag's blue, and the signature shape is the flag's double pennant.
The pennant draws itself behind the portrait in the hero and appears again as the brand mark, the favicon and the resume monogram.
Everything else on the page stays restrained so that the pennant is the thing you remember.

## Color

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#FAFAFA` | `#09090B` | Page |
| `--card` | `#FFFFFF` | `#111113` | Cards, form |
| `--foreground` | `#18181B` | `#F5F5F5` | Text |
| `--muted-foreground` | `#52525B` (7.3:1) | `#A1A1AA` (7.6:1) | Secondary text |
| `--border` | `#E4E4E7` | `#27272A` | Hairlines |
| `--primary` | `#DC143C` | `#E11D48` | Filled buttons, dots. White text on it is ≥4.7:1 |
| `--accent` | `#C3112F` | `#FB7C90` | Crimson *text* (fills and text need different values to pass AA) |
| `--flag` / `--ring` | `#003893` | `#8AA4FF` | Pennant outline, focus ring, team badge |

The resume sheet always uses the light values so it looks the same on screen and on paper.

## Type

- **Display:** Bricolage Grotesque 700–800, tight tracking (`-.035em`). Used for headings and the name only.
- **Body:** Geist 400–600.
- **Utility:** Geist Mono for eyebrows, badges, tags, dates and keyboard hints.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | Default for everything |
| `--dur-fast` / `--dur` / `--dur-slow` | 150 / 280 / 600 ms | Color / hover lift / reveals |

The moments that move:

- **Page load:** the headline rises line by line, the pennant's outline draws and then fills, and the portrait card settles in.
- **Scroll:** sections fade up, staggered by 70 ms.
- **Hover:** cards lift 3px with a crimson spotlight that follows the cursor. Buttons lift 1px. The d20 rerolls on the Battle Simulator card.
- **Filter:** the tab indicator slides, and cards morph into place with same-document View Transitions.
- **Theme:** the new theme spreads in a circle from the toggle.
- **Navigation:** pages cross-fade, and the header stays put (`view-transition-name: site-header`).

`prefers-reduced-motion: reduce` turns all of this off, and the content is fully visible without JavaScript.

## Rules

- Spend crimson on actions and live status only. Don't use it for decoration.
- Badges state facts ("On the Chrome Web Store", "ICSI 207 final project"). Don't invent status labels.
- No numbered section markers. The only ordered list on the page is the timeline, because it actually is a sequence.
- Minimum touch target is 44px. Keep the focus ring visible everywhere.
