#!/usr/bin/env bash
# Regenerate the site's raster icons from public/logo.svg.
#
# These outputs are committed to public/ so the build needs no image tooling;
# rerun this only when the logo changes. Requires ImageMagick 7 (`magick`).
#
#   ./site/scripts/generate-icons.sh
set -euo pipefail

here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
public="$here/../public"
src="$public/logo.svg"

# Favicon (.ico) with the sizes legacy browsers pick from. Transparent.
magick -background none -density 384 "$src" -resize 16x16 "$public/favicon-16.png"
magick -background none -density 384 "$src" -resize 32x32 "$public/favicon-32.png"
magick -background none -density 384 "$src" -resize 48x48 "$public/favicon-48.png"
magick "$public/favicon-16.png" "$public/favicon-32.png" "$public/favicon-48.png" \
  "$public/favicon.ico"
rm "$public/favicon-16.png" "$public/favicon-32.png" "$public/favicon-48.png"

# Apple touch icon: iOS renders it on an opaque tile, so flatten onto white
# with a little padding around the mark.
magick -background none -density 384 "$src" -resize 140x140 \
  -gravity center -background white -extent 180x180 -alpha remove -alpha off \
  "$public/apple-touch-icon.png"

# PWA / Android icons referenced by the web manifest.
magick -background none -density 512 "$src" -resize 192x192 "$public/icon-192.png"
magick -background none -density 512 "$src" -resize 512x512 "$public/icon-512.png"

# Maskable icon: adaptive-icon masks crop to ~80%, so keep the mark inside a
# safe zone on an opaque background.
magick -background none -density 512 "$src" -resize 300x300 \
  -gravity center -background white -extent 512x512 -alpha remove -alpha off \
  "$public/icon-maskable-512.png"

echo "Generated favicon.ico, apple-touch-icon.png, icon-192/512.png, icon-maskable-512.png"
