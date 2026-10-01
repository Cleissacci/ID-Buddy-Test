# Placing banners in Rise 360

Rise treats an image differently depending on the block it sits in. Pick the
block first, then the size.

| Where | How Rise shows it | Build at |
|---|---|---|
| **Image → Full width** block (recommended for a banner) | Full content width, aspect ratio kept, no cropping | 1920 × 600. Upload the 3840 × 1200 @2x file |
| **Image → Centered** block | Inside the text column, aspect ratio kept | 1920 × 600 works. The logo gets small, so consider `logo_width` around 1100 |
| **Image → Hero / text on image** | Fills a box and **crops** to fit, with text drawn over it | Don't use the logo banner here. If it must go here, use `"tagline": null`, keep the logo inside the centre 50%, and expect the edges to be cut |
| **Course cover image** | Fills the cover area and crops responsively. The course title is drawn over it | Not a good fit for a logo banner. Build a taller frame (for example 1920 × 1080) with the logo small and high, or ask Mir which cover style the theme uses |
| **Lesson header** (themes that allow an image) | A wide, short strip that may crop at the sides | 1920 × 400 (`"height": 400`) |

Rise's handling of covers and headers changes with theme updates. When the
target isn't a Full width block, tell Mir what you assumed and keep
everything important in the central safe area.

## Safe areas

- Keep the logo and tagline inside the central ~60% of the width.
- Nothing important goes in the outer 8% on any side.
- On phones, Rise scales a full-width image down to about 375 px wide. The
  logo at 50% width still reads, and the tagline becomes decorative. Don't
  bump the tagline size to fix that, because it unbalances the desktop view.

## File notes

- PNG keeps the grain and gradients clean, with no JPEG banding in the dark ground.
- Rise compresses uploads. The 2x file stays sharper after compression.
- Add alt text in Rise: the product name, e.g. "MSP.AI — Mastery Simulation Platform".
