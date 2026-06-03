#!/usr/bin/env node

import fs from 'node:fs';
import {log} from 'node:console';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEME_PATH = path.join(ROOT, 'THEME.md');
const SWATCH_DIR = path.join(ROOT, 'swatches');

function createSvg(color) {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">',
    `<rect x=".5" y=".5" width="15" height="15" rx="3" fill="${color}" stroke="rgba(0,0,0,0.08)"/>`,
    '</svg>',
  ].join('');
}

let md = fs.readFileSync(THEME_PATH, 'utf8');

// Strip existing swatches for idempotency
md = md.replace(/ ?!\[]\(swatches\/[^)]+\)/g, '');

// Collect unique hex codes from table cells (backtick-wrapped, after "| ")
const colors = new Set();
for (const m of md.matchAll(/(?<=\| )`(#[0-9a-fA-F]{3,8})`/g)) {
  colors.add(m[1]);
}

// Generate SVG files
fs.mkdirSync(SWATCH_DIR, {recursive: true});
for (const hex of colors) {
  const file = hex.slice(1).toLowerCase() + '.svg';
  fs.writeFileSync(path.join(SWATCH_DIR, file), createSvg(hex));
}

// Insert swatch images before hex codes in table cells
md = md.replace(
  /(\| )`(#[0-9a-fA-F]{3,8})`/g,
  (_, pre, hex) => {
    const file = hex.slice(1).toLowerCase() + '.svg';
    return `${pre}![](swatches/${file}) \`${hex}\``;
  },
);

fs.writeFileSync(THEME_PATH, md);
log(`Generated ${colors.size} color swatches in swatches/`);
