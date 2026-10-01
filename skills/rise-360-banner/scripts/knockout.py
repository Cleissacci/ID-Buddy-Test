#!/usr/bin/env python3
"""Rebuild a dark-on-transparent logo as a light knockout for dark grounds.

Brand accent colors are kept exactly. Every other opaque pixel is remapped by
its relative lightness: the darkest brand color becomes white, and any lighter
gradient inside the logo (a sweep, a glow) becomes a cool tint, so the logo
keeps its depth instead of going flat white.

Usage:
  knockout.py LOGO --analyze
      Print the logo's most common opaque colors so you can pick --keep.
  knockout.py LOGO OUT.png --keep "#15AEF5" [--keep ...] [--tol 28]
      [--tint "#96D6FA"] [--ground "#0B0A24"] [--preview PREVIEW.png]

Writes OUT.png (RGBA, same size). With --preview, also writes a 2x zoomed
crop of the left third of the logo on the ground color for a visual check.
"""
import argparse
from collections import Counter
from PIL import Image


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def lum(r, g, b):
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def analyze(img):
    px = img.load()
    w, h = img.size
    c = Counter()
    for y in range(0, h, 2):
        for x in range(0, w, 2):
            r, g, b, a = px[x, y]
            if a > 250:
                c[(r // 8 * 8, g // 8 * 8, b // 8 * 8)] += 1
    total = sum(c.values()) or 1
    print('Most common opaque colors (8-step buckets):')
    for (r, g, b), n in c.most_common(20):
        print(f'  #{r:02X}{g:02X}{b:02X}  {100 * n / total:5.1f}%')
    print('Pass the saturated brand accent(s) with --keep. Dark text/marks get remapped to white.')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('logo')
    ap.add_argument('out', nargs='?')
    ap.add_argument('--analyze', action='store_true')
    ap.add_argument('--keep', action='append', default=[], help='accent hex to keep as-is')
    ap.add_argument('--tol', type=float, default=28, help='RGB distance that still counts as an accent')
    ap.add_argument('--tint', default='#96D6FA', help='color for the lightest non-accent tones')
    ap.add_argument('--ground', default='#0B0A24', help='preview background')
    ap.add_argument('--preview')
    a = ap.parse_args()

    img = Image.open(a.logo).convert('RGBA')
    if a.analyze or not a.out:
        analyze(img)
        return

    keep = [hex_rgb(k) for k in a.keep]
    tint = hex_rgb(a.tint)
    px = img.load()
    w, h = img.size

    def is_accent(r, g, b):
        return any(((r - k[0]) ** 2 + (g - k[1]) ** 2 + (b - k[2]) ** 2) ** 0.5 <= a.tol for k in keep)

    # Lightness range of the non-accent artwork: 5th percentile = "base" dark brand color.
    ls = sorted(lum(*px[x, y][:3]) for y in range(0, h, 2) for x in range(0, w, 2)
                if px[x, y][3] > 250 and not is_accent(*px[x, y][:3]))
    if not ls:
        raise SystemExit('No opaque non-accent pixels found; check --keep / --tol.')
    lo, hi = ls[int(len(ls) * 0.05)], ls[int(len(ls) * 0.995)]
    span = max(hi - lo, 1e-6)
    flat = (hi - lo) < 12  # one solid color: map straight to white

    out = Image.new('RGBA', (w, h))
    dst = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, al = px[x, y]
            if al == 0:
                dst[x, y] = (0, 0, 0, 0)
            elif is_accent(r, g, b):
                dst[x, y] = (r, g, b, al)
            else:
                t = 0.0 if flat else max(0.0, min(1.0, (lum(r, g, b) - lo) / span)) ** 1.15
                dst[x, y] = (*(round(255 + (tint[i] - 255) * t) for i in range(3)), al)
    out.save(a.out, optimize=True)
    print(f'Wrote {a.out} ({w}x{h}); lightness range {lo:.0f}-{hi:.0f}{" (flat)" if flat else ""}')

    if a.preview:
        bg = Image.new('RGBA', (w, h), (*hex_rgb(a.ground), 255))
        bg.alpha_composite(out)
        crop = bg.crop((0, 0, max(1, w // 3), h))
        crop.resize((crop.width * 2, crop.height * 2)).save(a.preview)
        print(f'Preview crop: {a.preview}')


if __name__ == '__main__':
    main()
