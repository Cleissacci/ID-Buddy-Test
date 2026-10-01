---
name: rise-360-banner
description: Build premium, high-caliber banners for Articulate Rise 360 courses and microlearning from a brand or product logo — a dark "eclipse horizon" banner (deep ground, cyan-style horizon rim, centered logo, tracked tagline, copyright line), a light variant, and narrower lesson-header sizes, exported as Rise-ready PNGs at 1x and 2x, optionally also built on a Design canvas with tweaks. Use this whenever Mir asks for a Rise banner, course banner, microlearning banner, header or cover image for a Rise/Articulate course or video series, a "premium" or "high caliber" logo banner for e-learning, a white/knockout version of a logo for a dark background, or wants a light/narrow variant of an existing banner — even if he only says "make a banner for these videos" or attaches a logo and a handover.
---

# Rise 360 premium banner

Turn a logo into a banner that looks expensive inside a Rise course. The house
look is the **eclipse horizon**: a deep navy ground, a thin luminous horizon
line curving across the bottom like a planet's edge, a soft bloom behind a
centered logo, a single tracked tagline, faint dots at the far edges, fine
grain, and a small copyright line. It was developed and approved for MSP.AI
(see `references/design-spec.md` for the full spec and the reasoning).

Scripts live in `scripts/` next to this file. Work in a scratch folder.

## 1. Gather inputs (don't stall on them)

- **Logo** (required). Ideally PNG/WebP with a transparent background.
- **Brand colors.** Read them off the logo if not given (`knockout.py --analyze`).
- **Tagline.** Use the product's real descriptor (e.g. what the acronym stands
  for). Never invent marketing copy; if there's no real descriptor, leave it off.
- **Copyright line.** Mir's standing rule: every developed asset carries a
  copyright line. Default to `© <year> Sutherland` and flag the wording for him
  to confirm. It sits small and centered under the horizon, safe from cropping.
- **Where it goes in Rise.** Default: an *Image → Full width* block at
  1920×600. Read `references/rise-placement.md` when the target is a cover
  image, lesson header, or anything other than a full-width block.

If a handover or earlier canvas exists, read it first and build on its
decisions rather than starting over.

## 2. Make the dark-ground logo

A dark logo vanishes on a navy ground, so build a light knockout from the
**original** logo — not from an old knockout, which may carry artifacts.

```bash
python3 scripts/knockout.py logo.png --analyze          # see the colors
python3 scripts/knockout.py logo.png logo-white.png \
  --keep "#15AEF5" --preview logo-white-preview.png      # keep the accent(s)
```

`--keep` takes each saturated brand accent (nodes, dots, icons) and keeps it
exact. Everything else is remapped by lightness: the darkest brand color goes
to white and lighter gradient areas go to a cool tint (`--tint`), so a
gradient mark keeps its depth instead of going flat white.

**Look at the preview crop.** This is where things go wrong: if a gradient's
brightest tones sit close to the accent, they get kept as stray accent
specks. Lower `--tol` (default 28) until the specks disappear but the accent
edges stay clean. For a light-theme banner, use the original logo as is.

## 3. Build and render

Write a config (all keys are documented at the top of `build_banner.py`):

```json
{"logo": "logo-white.png", "logo_alt": "MSP.AI", "logo_width": 960,
 "tagline": "Mastery Simulation Platform", "copyright": "© 2026 Sutherland",
 "accent": "#15AEF5", "fonts_dir": "fonts", "title": "MSP.AI Rise Banner"}
```

```bash
bash scripts/fetch_fonts.sh Manrope fonts                 # local TTFs for rendering
python3 scripts/build_banner.py banner.json banner.html
node scripts/render.cjs banner.html MSP-AI_Rise-Banner 1920 600
```

Why local fonts: headless Chromium often can't reach `fonts.gstatic.com`
through a proxy even when curl can, and a silent fallback to Arial makes
the tagline look cheap. `render.cjs` prints which fonts loaded. If it says
`NONE`, fix the fonts before you deliver.

Variants come from the same config:
- **Lesson header:** `"height": 400`. The logo scales down to fit the height.
- **Light courses:** `"theme": "light"` with the original logo.
- **Brand recolor:** set `accent`, `ground` ([top, middle, bottom]) and `bloom`
  from the brand. Keep the ground very dark and low in saturation, and use
  exactly one accent.

## 4. Check it like a designer

Open the 1x PNG and a zoomed crop of the 2x (logo edge, horizon apex,
tagline). Check:
- The logo is crisp, with no halos or stray specks, and the accents are true to the brand.
- The tagline renders in the intended font, centered, and stays clear of the horizon.
- The horizon crests below the tagline with clear breathing room. Nothing
  important sits in the outer ~8% at the edges.
- The copyright line is legible but quiet.
- At phone width (the banner scaled to about 375 px wide), the logo still
  reads. The tagline won't, which is fine because it's decorative.

Fix it and re-render. Don't ship the first render unseen.

## 5. Design canvas (when Mir has one or asks for one)

If there's a Design canvas for the banner (a claude.ai artifact link in a
handover), update it there too so Mir can tweak it live:
1. Upload `logo-white.png` to the canvas as an asset and take its `/_blob/<id>` url.
2. Set `"logo"` to that url and `"logo_aspect"` to width/height, then run
   `build_banner.py config.json Main.dc.html --dc`. The artboard gets
   these tweaks: logo width, horizon glow, and switches for tagline, edge
   dots and copyright.
3. Follow the canvas type's own instructions to publish. Keep the previous
   version as a second artboard rather than overwriting it, so the two can be
   compared.

## 6. Deliver

- `<Brand>_Rise-Banner_1920x600.png` and `<Brand>_Rise-Banner_3840x1200@2x.png`.
  Recommend the 2x for Rise, since it stays sharp on retina screens.
- `<Brand>_Logo_White.png`, reusable on any dark background.
- The banner HTML source, so the PNGs can be re-rendered later.

Send the PNGs to Mir directly. If working in a repo, commit them in one
folder such as `brand/<brand>-banner/`. In the reply, cover:
- what was built and why it reads as premium
- where to place it in Rise
- the copyright wording to confirm
- an offer of the variants not yet made (lesson header, light)

Write the reply in Mir's voice (mir-voice skill), briefly.

## Premium, in one paragraph

Restraint does the work. Use one ground, one accent, one typeface, one tracked
line of type, and generous empty space around the logo. Get depth from light
(the bloom and the horizon) and texture (grain), not from ornament. Avoid HUD
corner brackets, rings, dot grids, gradient washes and stock tech motifs. They
were tried in an earlier MSP.AI round and read as a game screen, not a premium brand.
