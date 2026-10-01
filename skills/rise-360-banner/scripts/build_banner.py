#!/usr/bin/env python3
"""Generate a premium "eclipse horizon" Rise 360 banner from a JSON config.

  build_banner.py CONFIG.json OUT.html            # plain HTML, for PNG rendering
  build_banner.py CONFIG.json OUT.dc.html --dc    # Design-canvas artboard with tweaks

Config keys (all optional except logo):
  logo            path (html mode, relative to OUT) or /_blob/<id> url (dc mode)
  logo_aspect     width/height of the logo; read from the file when it is local
  width, height   canvas px (default 1920 x 600)
  logo_width      px (default 50% of width, capped so the logo fits the height)
  tagline         small tracked line under the logo, or null to omit
  copyright       e.g. "© 2026 Sutherland", or null to omit
  theme           "dark" (default) or "light"
  accent          brand accent hex for the horizon rim and haze (default #15AEF5)
  ground          [top, middle, bottom] hexes for the ground gradient
  bloom           hex of the soft light behind the logo
  ink             text color for tagline/copyright
  horizon         true/false (default true)
  glow            horizon glow strength, 0-1.5 (default 1)
  nodes           faint dots at the outer edges, true/false (default true)
  seed            dot layout seed (default 7)
  font            Google font family (default Manrope)
  fonts_dir       folder with <font>-500.ttf / <font>-600.ttf for offline rendering
  title           <title> of the page (default "Rise Banner")
"""
import json, os, random, sys

THEMES = {
    'dark': dict(ground=['#0E0C30', '#0B0A24', '#07061A'], bloom='#2A3C9E', mid='#1E1B47',
                 body=['#0A0A26', '#05040F'], ink='236,244,255', rim_core='#DFF4FF',
                 dot='#FFFFFF', tag_a=0.78, copy_a=0.45, rule_a=0.4),
    'light': dict(ground=['#FBFCFE', '#F4F7FB', '#E9EEF6'], bloom='#DCEBFA', mid='#EEF3FA',
                  body=['#E6ECF5', '#DCE4EF'], ink='30,27,71', rim_core='#FFFFFF',
                  dot='#1E1B47', tag_a=0.72, copy_a=0.5, rule_a=0.35),
}


def rgba(hexc, a):
    h = hexc.lstrip('#')
    return f'rgba({int(h[0:2],16)},{int(h[2:4],16)},{int(h[4:6],16)},{a})'


def dots_svg(W, H, apex, seed, color, fade=1.0):
    rnd = random.Random(seed)
    s = W / 1920
    out = []
    while len(out) < 46:
        x = rnd.uniform(70 * s, W - 70 * s)
        y = rnd.uniform(60 * H / 600, apex - 70 * H / 600)
        if 0.224 * W < x < 0.776 * W:   # keep the logo zone clean
            continue
        r = rnd.choice([1, 1, 1.2, 1.4, 1.8, 2.4])
        o = round(rnd.uniform(0.10, 0.42) * (1 if r < 2 else 0.8) * fade, 2)
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{color}" fill-opacity="{o}"></circle>')
    return '\n'.join(out)


def build(cfg, out_path, dc=False):
    W, H = cfg.get('width', 1920), cfg.get('height', 600)
    th = THEMES[cfg.get('theme', 'dark')]
    ground = cfg.get('ground', th['ground'])
    bloom = cfg.get('bloom', th['bloom'])
    accent = cfg.get('accent', '#15AEF5')
    ink = th['ink'] if 'ink' not in cfg else ','.join(str(int(cfg['ink'].lstrip('#')[i:i+2], 16)) for i in (0, 2, 4))
    font = cfg.get('font', 'Manrope')
    horizon = cfg.get('horizon', True)
    nodes = cfg.get('nodes', True)
    glow = float(cfg.get('glow', 1))
    tagline, copyright_ = cfg.get('tagline'), cfg.get('copyright')
    s = W / 1920
    apex = round(H * 0.85) if horizon else H

    aspect = cfg.get('logo_aspect')
    if not aspect and not dc:
        from PIL import Image
        lp = os.path.join(os.path.dirname(os.path.abspath(out_path)), cfg['logo'])
        im = Image.open(lp)
        aspect = im.width / im.height
    aspect = aspect or 4.9
    max_logo_h = (apex - (90 if tagline else 40) * H / 600) * 0.62
    logo_w = round(min(cfg.get('logo_width', W * 0.5), max_logo_h * aspect))

    # Horizon: a huge ellipse whose top edge crests at `apex`.
    rx, ry = 2600 * s, 2010 * s
    cy = apex + ry
    tag_size = max(14, round(17 * s))
    gap = round(34 * H / 600)

    if dc:
        logo_w_attr, haze_core, haze_mid, rim_bloom = '{{logoW}}', '{{hazeCore}}', '{{hazeMid}}', '{{rimBloom}}'
    else:
        logo_w_attr = str(logo_w)
        haze_core, haze_mid, rim_bloom = (f'{min(1, v * glow):.3f}' for v in (0.38, 0.08, 0.8))

    if cfg.get('fonts_dir') and not dc:
        fd = os.path.relpath(cfg['fonts_dir'], os.path.dirname(os.path.abspath(out_path)))
        fam = font.replace(' ', '')
        font_head = (f'<style>@font-face{{font-family:"{font}";font-weight:500;src:url({fd}/{fam}-500.ttf)}}'
                     f'@font-face{{font-family:"{font}";font-weight:600;src:url({fd}/{fam}-600.ttf)}}</style>')
    else:
        font_head = (f'<link rel="preconnect" href="https://fonts.googleapis.com">\n'
                     f'<link href="https://fonts.googleapis.com/css2?family={font.replace(" ", "+")}:wght@500;600&amp;display=swap" rel="stylesheet">')

    def wrap_if(flag_name, inner, on):
        if dc:
            return f'<sc-if value="{{{{{flag_name}}}}}" hint-placeholder-val="{{{{ true }}}}">\n{inner}\n</sc-if>'
        return inner if on else ''

    horizon_svg = f'''<rect width="{W}" height="{H}" fill="url(#rb-haze)"></rect>
<ellipse cx="{W/2:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="url(#rb-body)"></ellipse>
<ellipse cx="{W/2:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="none" stroke="url(#rb-rim)" stroke-width="{6*s:.2f}" filter="url(#rb-soft)" opacity="{rim_bloom}"></ellipse>
<ellipse cx="{W/2:.0f}" cy="{cy:.0f}" rx="{rx:.0f}" ry="{ry:.0f}" fill="none" stroke="url(#rb-rim)" stroke-width="{1.25*s:.2f}"></ellipse>''' if horizon else ''

    tagline_html = ''
    if tagline:
        tagline_html = wrap_if('showTagline', f'''<div style="display: flex; align-items: center; gap: {round(26*s)}px">
<div style="width: {round(72*s)}px; height: 1px; background: linear-gradient(90deg, rgba({ink},0), rgba({ink},{th['rule_a']}))"></div>
<div style="font-size: {tag_size}px; font-weight: 600; letter-spacing: 0.46em; color: rgba({ink},{th['tag_a']}); text-transform: uppercase; padding-left: 0.46em">{tagline}</div>
<div style="width: {round(72*s)}px; height: 1px; background: linear-gradient(90deg, rgba({ink},{th['rule_a']}), rgba({ink},0))"></div>
</div>''', True)

    copy_html = ''
    if copyright_:
        copy_html = wrap_if('showCopyright', f'<div style="position: absolute; left: 0; right: 0; bottom: {round(30*H/600)}px; text-align: center; font-size: {max(11, round(12*s))}px; font-weight: 500; letter-spacing: 0.12em; color: rgba({ink},{th["copy_a"]})">{copyright_}</div>', True)

    body = f'''<div style="width: {W}px; height: {H}px; position: relative; overflow: hidden; background: linear-gradient(180deg, {ground[0]} 0%, {ground[1]} 55%, {ground[2]} 100%); font-family: '{font}', 'Helvetica Neue', sans-serif">
<svg width="{W}" height="{H}" viewBox="0 0 {W} {H}" style="position: absolute; left: 0; top: 0" aria-hidden="true">
<defs>
<radialGradient id="rb-bloom" cx="{W/2:.0f}" cy="{apex*0.54:.0f}" r="{760*s:.0f}" gradientUnits="userSpaceOnUse" gradientTransform="translate({W/2:.0f} {apex*0.54:.0f}) scale(1 {0.42*H/600/s:.3f}) translate({-W/2:.0f} {-apex*0.54:.0f})">
<stop offset="0" stop-color="{bloom}" stop-opacity="0.55"></stop>
<stop offset="0.45" stop-color="{th['mid']}" stop-opacity="0.35"></stop>
<stop offset="1" stop-color="{ground[1]}" stop-opacity="0"></stop>
</radialGradient>
<radialGradient id="rb-haze" cx="{W/2:.0f}" cy="{apex+10*H/600:.0f}" r="{900*s:.0f}" gradientUnits="userSpaceOnUse" gradientTransform="translate({W/2:.0f} {apex+10*H/600:.0f}) scale(1 {0.16*H/600/s:.3f}) translate({-W/2:.0f} {-(apex+10*H/600):.0f})">
<stop offset="0" stop-color="{accent}" stop-opacity="{haze_core}"></stop>
<stop offset="0.5" stop-color="{accent}" stop-opacity="{haze_mid}"></stop>
<stop offset="1" stop-color="{accent}" stop-opacity="0"></stop>
</radialGradient>
<linearGradient id="rb-rim" x1="0" y1="0" x2="{W}" y2="0" gradientUnits="userSpaceOnUse">
<stop offset="0.04" stop-color="{accent}" stop-opacity="0"></stop>
<stop offset="0.3" stop-color="{accent}" stop-opacity="0.55"></stop>
<stop offset="0.5" stop-color="{th['rim_core']}" stop-opacity="1"></stop>
<stop offset="0.7" stop-color="{accent}" stop-opacity="0.55"></stop>
<stop offset="0.96" stop-color="{accent}" stop-opacity="0"></stop>
</linearGradient>
<linearGradient id="rb-body" x1="0" y1="{apex-10:.0f}" x2="0" y2="{H}" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="{th['body'][0]}"></stop>
<stop offset="1" stop-color="{th['body'][1]}"></stop>
</linearGradient>
<filter id="rb-soft" x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="{6*s:.1f}"></feGaussianBlur></filter>
<filter id="rb-grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch"></feTurbulence><feColorMatrix type="saturate" values="0"></feColorMatrix></filter>
</defs>
<rect width="{W}" height="{H}" fill="url(#rb-bloom)"></rect>
{wrap_if('showNodes', '<g>' + chr(10) + dots_svg(W, H, apex, cfg.get('seed', 7), th['dot'], 1.0 if cfg.get('theme', 'dark') == 'dark' else 0.6) + chr(10) + '</g>', nodes)}
{horizon_svg}
<rect width="{W}" height="{H}" filter="url(#rb-grain)" opacity="{0.05 if cfg.get('theme','dark')=='dark' else 0.035}"></rect>
</svg>
<div style="position: absolute; left: 0; right: 0; top: 0; height: {apex}px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: {gap}px">
<img src="{cfg['logo']}" alt="{cfg.get('logo_alt', 'Logo')}" style="width: {logo_w_attr}px; height: auto; display: block">
{tagline_html}
</div>
{copy_html}
</div>'''

    title = cfg.get('title', 'Rise Banner')
    if dc:
        props = {
            'logoW': {'editor': 'range', 'min': round(logo_w * 0.8 / 20) * 20, 'max': round(logo_w * 1.25 / 20) * 20, 'step': 20, 'unit': 'px', 'default': logo_w},
            'horizonGlow': {'editor': 'range', 'min': 0, 'max': 150, 'step': 5, 'unit': '%', 'default': round(glow * 100)},
            'showTagline': {'editor': 'boolean', 'default': True},
            'showNodes': {'editor': 'boolean', 'default': bool(nodes)},
            'showCopyright': {'editor': 'boolean', 'default': True},
            '$preview': {'width': W, 'height': H},
        }
        doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{font_head}
<style>
body{{margin:0}}
</style>
</helmet>
{body}
</x-dc>
<script type="text/x-dc" data-dc-script data-props='{json.dumps(props, ensure_ascii=False)}'>
class Component extends DCLogic {{
renderVals() {{
const g = (this.props.horizonGlow ?? {round(glow*100)}) / 100;
return {{
logoW: this.props.logoW ?? {logo_w},
showTagline: this.props.showTagline ?? true,
showNodes: this.props.showNodes ?? {str(bool(nodes)).lower()},
showCopyright: this.props.showCopyright ?? true,
hazeCore: Math.min(1, 0.38 * g),
hazeMid: Math.min(1, 0.08 * g),
rimBloom: Math.min(1, 0.8 * g)
}};
}}
}}
</script>
</body>
</html>
'''
    else:
        doc = f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
{font_head}
<style>body{{margin:0}}</style>
</head>
<body>
{body}
</body>
</html>
'''
    with open(out_path, 'w') as f:
        f.write(doc)
    print(f'Wrote {out_path}  ({W}x{H}, logo {logo_w}px, horizon apex y={apex})')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    build(json.load(open(sys.argv[1])), sys.argv[2], dc='--dc' in sys.argv)
