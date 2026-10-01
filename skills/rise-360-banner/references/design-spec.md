# Eclipse horizon — design spec

The approved MSP.AI v3 banner, in numbers. `build_banner.py` produces it,
and all geometry scales with width and height.

## Layer stack (back to front), 1920 × 600

| # | Layer | Spec |
|---|---|---|
| 1 | Ground | Vertical gradient: #0E0C30 at 0%, #0B0A24 at 55%, #07061A at 100% |
| 2 | Bloom | Radial ellipse at (960, 275), r 760, squashed to 0.42 high. #2A3C9E at 55% → brand navy #1E1B47 at 35% → transparent |
| 3 | Edge dots | 46 dots, r 1–2.4 px, white at 8–42% opacity, only in the outer 22% each side and above the horizon. Echoes the logo's floating dots |
| 4 | Haze | Accent-colored radial glow at the horizon apex, squashed to 0.16 high. 38% at the centre, 8% at mid |
| 5 | Horizon body | Ellipse rx 2600, ry 2010, cresting at y = 0.85·H (510). Fill #0A0A26 → #05040F |
| 6 | Rim bloom | Same ellipse, stroke 6 px, blur 6, 80% opacity |
| 7 | Rim line | Same ellipse, 1.25 px stroke. Horizontal gradient: transparent at the edges, accent at 55% by 30%/70%, near-white #DFF4FF at the centre |
| 8 | Grain | fractalNoise 0.85, desaturated, 5% opacity |
| 9 | Logo | Centered in the band above the horizon (0 to 510). 960 px wide (50% of W) |
| 10 | Tagline | 34 px below the logo. Manrope SemiBold 17 px, uppercase, letter spacing 0.46em, white at 78%. 72 px rules on each side that fade outward |
| 11 | Copyright | Centered, 30 px from the bottom, on the horizon body. Manrope Medium 12 px, letter spacing 0.12em, white at 45% |

## Why each choice

- **The horizon** gives a sense of arrival and mastery without literal
  imagery, and it puts the brightest point of light right under the logo.
- **Bloom, not a frame.** Lighting from behind lifts the logo off the ground
  more elegantly than an outline or rings.
- **Edge dots, not a grid.** A grid reads as a template. A few sparse dots
  echo the brand mark and keep the centre clean.
- **One tracked line of type** is the classic premium device. Wide letter
  spacing at a small size, with low-contrast rules that fade out at the ends.
- **The copyright sits under the horizon,** on the darkest area, centered.
  There it's legible, out of the way, and away from edges that Rise could crop.

## Light theme

The ground runs #FBFCFE → #F4F7FB → #E9EEF6, and the horizon body is
#E6ECF5 → #DCE4EF. The rim core is white and the dots are navy at 60%
of their dark-theme opacity. The tagline and copyright use brand navy, and
the logo is the original colors. Grain is at 3.5%.

## Knockout logo lessons (from MSP.AI)

- The first knockout was made by a blunt recolor, and it smeared the head's
  gradient into a cyan-white blotch. Always rebuild from the original.
- The head's gradient peaked at about rgb(20,150,222), close to the brand
  cyan rgb(21,174,245). A loose accent match keeps those gradient pixels as
  "accent" specks. A tolerance of about 28 (RGB distance) separated them.
- The outlines between the nodes and the head were transparent gaps, not
  white. The knockout keeps those gaps, so the nodes stay separate on dark
  grounds.

## Lesson header (1920 × 400)

Same composition with the horizon at y = 340. The logo is capped by
height (about 850 px wide for a 4.9:1 logo), and the tagline keeps its 17 px
size because Rise scales the image by width.
