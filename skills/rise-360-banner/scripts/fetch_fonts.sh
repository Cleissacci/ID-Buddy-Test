#!/usr/bin/env bash
# Download a Google Font's 500 and 600 weights as TTF for offline rendering.
#   fetch_fonts.sh "Manrope" OUT_DIR   ->  OUT_DIR/Manrope-500.ttf, OUT_DIR/Manrope-600.ttf
# Headless Chromium often cannot reach fonts.gstatic.com through a proxy even
# when curl can, so render from local files instead of the Google Fonts link.
set -euo pipefail
FAMILY="$1"; OUT="${2:-fonts}"; mkdir -p "$OUT"
NAME="${FAMILY// /}"; Q="${FAMILY// /+}"
for W in 500 600; do
  URL=$(curl -sS -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=${Q}:wght@${W}" | grep -o 'https://fonts.gstatic.com[^)]*' | head -1)
  [ -n "$URL" ] || { echo "No $W weight found for $FAMILY" >&2; exit 1; }
  curl -sS -o "$OUT/${NAME}-${W}.ttf" "$URL"
  echo "Wrote $OUT/${NAME}-${W}.ttf"
done
