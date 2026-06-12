#!/usr/bin/env tsx

/**
 * Generates THEME.md and color swatch SVGs from panda.config.ts color tokens.
 * Run after changing any color tokens: `pnpm swatches`
 */

import fs from 'node:fs';
import {log} from 'node:console';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateColorScale} from './generate-color-scale';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const THEME_PATH = path.join(ROOT, 'THEME.md');
const SWATCH_DIR = path.join(ROOT, 'swatches');

// ---------------------------------------------------------------------------
// 1. Color palettes (must match panda.config.ts)
// ---------------------------------------------------------------------------

function flatScale(
  scale: Record<string, {value: string}>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [step, {value}] of Object.entries(scale)) {
    out[step] = value;
  }
  return out;
}

const palettes: Record<string, Record<string, string>> = {
  gray: {
    ...flatScale(generateColorScale('#6a7b8c')),
    '50': '#f1f4f7',
  },
  green: flatScale(generateColorScale('#26a332')),
  teal: flatScale(generateColorScale('#1ca49e')),
  red: {
    '50': '#fceef0',
    '100': '#f9d1d8',
    '200': '#f1bcc5',
    '300': '#e28d9b',
    '400': '#da4e65',
    '500': '#d92644',
    '600': '#e31a3b',
    '700': '#842e3d',
    '800': '#6b2e38',
    '900': '#562b32',
  },
  yellow: flatScale(generateColorScale('#f0aa00')),
  blue: flatScale(generateColorScale('#4a98ff')),
  cyan: flatScale(generateColorScale('#40b9dd')),
  orange: flatScale(generateColorScale('#eb6d02')),
  pink: flatScale(generateColorScale('#d951a8')),
  purple: flatScale(generateColorScale('#7952ff')),
};

function p(ref: string): string {
  const parts = ref.split('.');
  const hex = palettes[parts[0]]?.[parts[1]];
  if (hex == null) {
    throw new Error(`Unknown palette ref: ${ref}`);
  }
  return hex;
}

// Short display name for a palette ref, e.g. "purple.500" → "purple-500"
function shortName(ref: string): string {
  return ref.replace('.', '-');
}

// ---------------------------------------------------------------------------
// 2. Semantic token definitions (must match panda.config.ts)
// ---------------------------------------------------------------------------

// Each value is either a palette ref "palette.step" or a literal hex like "#fff"
interface ColorValue {
  hex: string;
  label: string;
}

function v(ref: string): ColorValue {
  return {hex: p(ref), label: shortName(ref)};
}

function literal(hex: string): ColorValue {
  return {hex, label: hex};
}

type TokenDef = [suffix: string, light: ColorValue, dark: ColorValue];

const semanticTokens: TokenDef[] = [
  // Primary
  ['primary', v('teal.500'), v('teal.500')],
  ['primary-hover', v('teal.600'), v('teal.600')],
  ['primary-active', v('teal.700'), v('teal.700')],
  ['primary-subtle', v('teal.100'), v('teal.900')],
  // Destructive
  ['destructive', v('red.600'), v('red.500')],
  ['destructive-hover', v('red.700'), v('red.400')],
  ['destructive-active', v('red.800'), v('red.300')],
  ['destructive-fg', literal('#fff'), literal('#fff')],
  // Foreground
  ['fg', v('gray.900'), v('gray.50')],
  ['fg-muted', v('gray.600'), v('gray.200')],
  ['fg-disabled', v('gray.200'), v('gray.600')],
  ['fg-on-primary', literal('#fff'), literal('#fff')],
  // Background
  ['bg', literal('#ffffff'), v('gray.900')],
  ['bg-subtle', v('gray.50'), v('gray.800')],
  ['bg-hover', v('gray.50'), v('gray.900')],
  ['bg-selected', v('teal.100'), v('teal.900')],
  // Border
  ['border', v('gray.100'), v('gray.900')],
  ['border-emphasized', v('gray.100'), v('gray.700')],
  // Track
  ['track', v('gray.100'), v('gray.700')],
  ['track-emphasized', v('gray.300'), v('gray.600')],
  ['track-disabled', v('gray.300'), v('gray.700')],
  // Skeleton
  ['skeleton', v('gray.100'), v('gray.600')],
  ['skeleton-shimmer', v('gray.50'), v('gray.500')],
  // Status
  ['status-success-fg', v('green.600'), v('green.600')],
  ['status-success-border', v('green.600'), v('green.400')],
  ['status-success-solid', v('green.600'), v('green.500')],
  ['status-success-solid-fg', literal('#fff'), literal('#fff')],
  ['status-error-fg', v('red.500'), v('red.500')],
  ['status-error-border', v('red.600'), v('red.400')],
  ['status-error-solid', v('red.600'), v('red.500')],
  ['status-error-solid-fg', literal('#fff'), literal('#fff')],
  ['status-warning-fg', v('yellow.500'), v('yellow.500')],
  ['status-warning-border', v('yellow.500'), v('yellow.400')],
  ['status-warning-solid', v('yellow.500'), v('yellow.400')],
  ['status-warning-solid-fg', literal('#fff'), literal('#fff')],
  ['status-info-fg', v('blue.700'), v('blue.700')],
  ['status-info-solid', v('teal.500'), v('teal.500')],
  ['status-info-solid-fg', literal('#fff'), literal('#fff')],
  ['status-neutral-solid', v('gray.500'), v('gray.400')],
  ['status-neutral-solid-fg', literal('#fff'), literal('#fff')],
  ['status-disabled-solid', v('gray.400'), v('gray.600')],
  ['status-disabled-solid-fg', literal('#fff'), literal('#fff')],
  // Presence
  ['presence-success', v('green.500'), v('green.400')],
  ['presence-neutral', v('gray.500'), v('gray.400')],
  ['presence-error', v('red.600'), v('red.400')],
  // Icon
  ['icon-primary', v('gray.900'), v('gray.50')],
  ['icon-secondary', v('gray.600'), v('gray.400')],
  ['icon-tertiary', v('gray.500'), v('gray.500')],
  ['icon-disabled', v('gray.400'), v('gray.600')],
  ['icon-accent', v('teal.500'), v('teal.500')],
  ['icon-success', v('green.600'), v('green.600')],
  ['icon-error', v('red.500'), v('red.500')],
  ['icon-warning', v('yellow.500'), v('yellow.500')],
  ['icon-info', v('blue.700'), v('blue.700')],
  ['icon-blue', v('blue.700'), v('blue.500')],
  ['icon-red', v('red.600'), v('red.600')],
  ['icon-green', v('green.600'), v('green.600')],
  ['icon-gray', v('gray.600'), v('gray.200')],
  ['icon-cyan', v('cyan.600'), v('cyan.500')],
  ['icon-teal', v('teal.500'), v('teal.500')],
  ['icon-yellow', v('yellow.300'), v('yellow.200')],
  ['icon-orange', v('orange.500'), v('orange.500')],
  ['icon-pink', v('pink.600'), v('pink.500')],
  ['icon-purple', v('purple.700'), v('purple.500')],
];

// Surface tokens follow a consistent pattern
const surfaceConfigs: Array<{
  name: string;
  palette: string;
  pattern: Array<[string, string, string]>;
}> = ['green', 'red'].map(name => ({
  name,
  palette: name,
  pattern: [
    ['', '100', '900'],
    ['-fg', '800', '200'],
    ['-hover', '200', '800'],
    ['-accent', '600', '400'],
  ],
}));

surfaceConfigs.push(
  {
    name: 'blue',
    palette: 'blue',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '100'],
      ['-hover', '200', '800'],
      ['-accent', '700', '500'],
    ],
  },
  {
    name: 'cyan',
    palette: 'cyan',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '200'],
      ['-hover', '200', '800'],
      ['-accent', '600', '700'],
    ],
  },
  {
    name: 'gray',
    palette: 'gray',
    pattern: [
      ['', '50', '800'],
      ['-fg', '900', '100'],
      ['-hover', '100', '700'],
      ['-accent', '600', '400'],
    ],
  },
  {
    name: 'orange',
    palette: 'orange',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '200'],
      ['-hover', '200', '800'],
      ['-accent', '500', '700'],
    ],
  },
  {
    name: 'pink',
    palette: 'pink',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '200'],
      ['-hover', '200', '800'],
      ['-accent', '500', '600'],
    ],
  },
  {
    name: 'purple',
    palette: 'purple',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '200'],
      ['-hover', '200', '800'],
      ['-accent', '200', '500'],
    ],
  },
  {
    name: 'teal',
    palette: 'teal',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '300'],
      ['-hover', '200', '800'],
      ['-accent', '500', '700'],
    ],
  },
  {
    name: 'yellow',
    palette: 'yellow',
    pattern: [
      ['', '100', '900'],
      ['-fg', '800', '400'],
      ['-hover', '200', '800'],
      ['-accent', '600', '700'],
    ],
  },
);

surfaceConfigs.sort((a, b) => a.name.localeCompare(b.name));

const surfaceTokens: TokenDef[] = [];
for (const {name, palette, pattern} of surfaceConfigs) {
  for (const [suffix, lightStep, darkStep] of pattern) {
    surfaceTokens.push([
      `surface-${name}${suffix}`,
      v(`${palette}.${lightStep}`),
      v(`${palette}.${darkStep}`),
    ]);
  }
}

// ---------------------------------------------------------------------------
// 3. SVG swatch helpers
// ---------------------------------------------------------------------------

function createSvg(color: string): string {
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16">',
    `<rect x=".5" y=".5" width="15" height="15" rx="3" fill="${color}" stroke="rgba(0,0,0,0.08)"/>`,
    '</svg>',
  ].join('');
}

function swatchFile(hex: string): string {
  return hex.replace(/^#/, '').toLowerCase() + '.svg';
}

function sw(val: ColorValue): string {
  return `![](swatches/${swatchFile(val.hex)}) ${val.label}`;
}

function swHex(hex: string): string {
  return `![](swatches/${swatchFile(hex)}) \`${hex}\``;
}

// ---------------------------------------------------------------------------
// 4. Markdown helpers
// ---------------------------------------------------------------------------

function tokensBetween(startPrefix: string, endPrefix?: string): TokenDef[] {
  let started = false;
  const result: TokenDef[] = [];
  for (const t of semanticTokens) {
    if (t[0].startsWith(startPrefix)) {
      started = true;
    }
    if (started) {
      if (endPrefix != null && t[0].startsWith(endPrefix)) {
        break;
      }
      result.push(t);
    }
  }
  return result;
}

function colorTable(tokens: TokenDef[]): string {
  const rows = tokens.map(
    ([s, l, d]) => `| \`--silver-colors-${s}\` | ${sw(l)} | ${sw(d)} |`,
  );
  return ['| Variable | Light | Dark |', '| --- | --- | --- |', ...rows].join(
    '\n',
  );
}

function scaleTable(scaleName: string, scale: Record<string, string>): string {
  const steps = [
    '50',
    '100',
    '200',
    '300',
    '400',
    '500',
    '600',
    '700',
    '800',
    '900',
  ];
  const rows = steps
    .filter(s => scale[s] != null)
    .map(
      s =>
        `| \`--silver-colors-${scaleName}-${s}\` | ${scaleName}-${s} | ${swHex(scale[s])} |`,
    );
  return [
    `#### ${scaleName}`,
    '',
    '| Variable | Name | Value |',
    '| --- | --- | --- |',
    ...rows,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// 5. Generate THEME.md
// ---------------------------------------------------------------------------

const lines: string[] = [];

function section(...content: string[]): void {
  lines.push(...content, '');
}

section(
  '# Theming',
  '',
  'silver-ui uses CSS custom properties (variables) prefixed with `--silver-` for',
  'all visual tokens. Override any variable at `:root` to change the default theme,',
  'or scope overrides to a container for branded areas.',
  '',
  'All library styles use CSS `@layer`, so your custom CSS always takes precedence',
  'without specificity battles.',
);

section(
  '## Quick start',
  '',
  'Use the `<Theme>` component for app-wide or scoped theme overrides. It maps',
  'friendly token names to the Silver CSS variables used by every component.',
  '',
  '```tsx',
  "import {Button, Theme} from 'silver-ui';",
  '',
  'export function App() {',
  '  return (',
  '    <Theme',
  '      mode="light"',
  '      tokens={{',
  '        colors: {',
  "          primary: 'teal-500',",
  "          primaryHover: 'teal-600',",
  "          primaryActive: 'teal-700',",
  "          primarySubtle: 'teal-100',",
  '        },',
  '        fonts: {',
  "          body: 'Inter, system-ui, sans-serif',",
  '        },',
  '        radii: {',
  "          componentMd: '0.5rem',",
  '        },',
  '      }}>',
  '      <Button label="Save" />',
  '    </Theme>',
  '  );',
  '}',
  '```',
  '',
  'Palette references can use either `teal-500` or `teal.500` syntax. Custom CSS',
  'values like `#225bff`, `oklch(...)`, or `var(...)` are also supported.',
);

section(
  '## Dark mode',
  '',
  'Dark-mode tokens activate under `[data-theme="dark"]` or',
  '`@media (prefers-color-scheme: dark)`. Set `data-theme="dark"` on a parent',
  'element and override dark values there:',
  '',
  '```css',
  "[data-theme='dark'] {",
  '  --silver-colors-primary: #93c5fd;',
  '  --silver-colors-bg: #0f172a;',
  '  --silver-colors-fg: #f8fafc;',
  '}',
  '```',
);

section(
  '## Scoped themes',
  '',
  '`<Theme>` scopes token overrides to its subtree, so multiple themed areas can',
  'coexist on the same page.',
  '',
  '```tsx',
  '<Theme',
  '  tokens={{',
  '    colors: {',
  "      bg: '#ffffff',",
  "      bgSubtle: 'gray-50',",
  "      primary: 'purple-500',",
  '    },',
  '  }}>',
  '  <Button label="Themed action" />',
  '</Theme>',
  '```',
);

section(
  '## CSS variable escape hatch',
  '',
  'For non-React surfaces or global CSS, set the underlying custom properties',
  'directly. These are the same variables generated by `<Theme>`.',
  '',
  '```css',
  ':root {',
  '  --silver-colors-primary: var(--silver-colors-teal-500);',
  '  --silver-colors-primary-hover: var(--silver-colors-teal-600);',
  '  --silver-colors-primary-active: var(--silver-colors-teal-700);',
  '  --silver-radii-component-md: 0.5rem;',
  '  --silver-fonts-body: Inter, system-ui, sans-serif;',
  '}',
  '```',
  '',
  'CSS variables can also be scoped to any container:',
  '',
  '```tsx',
  '<div',
  '  style={{',
  "    '--silver-colors-primary': 'var(--silver-colors-purple-500)',",
  '  }}>',
  '  <Button label="Save" />',
  '</div>',
  '```',
);

section(
  '## Per-instance overrides',
  '',
  'Every component accepts `className` and `style` props:',
  '',
  '```tsx',
  '<Button',
  '  className="danger-action"',
  '  label="Delete"',
  "  style={{'--silver-radii-component-md': '9999px'}}",
  '/>',
  '```',
);

section(
  '---',
  '',
  '## CSS variable reference',
  '',
  'All variables below are emitted by the Panda CSS build. The authoritative source',
  'is `panda.config.ts`. Variables marked with light/dark values respond',
  'automatically to theme mode.',
);

// Base color scales — placed early so palette overrides are easy to find
const paletteOrder = [
  'gray',
  'blue',
  'cyan',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

section(
  '### Base color scales',
  '',
  'These are the raw color palettes that semantic tokens reference. Override',
  'semantic tokens (below) rather than these unless you need to change the entire',
  'palette.',
  '',
  'Each scale has steps `50` through `900`.',
  '',
  ...paletteOrder.map(name => scaleTable(name, palettes[name])),
);

section('---');

section(
  '### Primary colors',
  '',
  'The main brand color used for buttons, links, focus rings, and selected states.',
  '',
  colorTable(tokensBetween('primary', 'destructive')),
);

section(
  '### Destructive colors',
  '',
  'Used for destructive actions (delete buttons, error confirmations).',
  '',
  colorTable(tokensBetween('destructive', 'fg')),
);

section(
  '### Foreground colors',
  '',
  'Text and icon colors.',
  '',
  colorTable(tokensBetween('fg', 'bg')),
);

// Background is special — has rgba rows
const bgTokenRows = tokensBetween('bg', 'border').map(
  ([s, l, d]) => `| \`--silver-colors-${s}\` | ${sw(l)} | ${sw(d)} |`,
);
section(
  '### Background colors',
  '',
  'Surface and container backgrounds.',
  '',
  '| Variable | Light | Dark |',
  '| --- | --- | --- |',
  ...bgTokenRows,
  '| `--silver-colors-bg-ghost-hover` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` |',
  '| `--silver-colors-bg-ghost-active` | `rgba(0,0,0,0.1)` | `rgba(255,255,255,0.12)` |',
);

section('### Border colors', '', colorTable(tokensBetween('border', 'track')));

section(
  '### Track colors',
  '',
  'Slider tracks, progress bars, and similar range indicators.',
  '',
  colorTable(tokensBetween('track', 'skeleton')),
);

section(
  '### Overlay colors',
  '',
  'Backdrops for modals, drawers, and dialogs.',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-colors-overlay-scrim` | `rgba(0,0,0,0.45)` |',
  '| `--silver-colors-overlay-scrim-subtle` | `rgba(0,0,0,0.35)` |',
  '| `--silver-colors-overlay-scrim-strong` | `rgba(0,0,0,0.76)` |',
);

section(
  '### Skeleton colors',
  '',
  'Loading placeholder pulse animation.',
  '',
  colorTable(tokensBetween('skeleton', 'status')),
);

section(
  '### Status colors',
  '',
  'Used by Alert, Badge, Toast, Stepper, and form validation states.',
  '',
  colorTable(tokensBetween('status', 'presence')),
);

section(
  '### Presence colors',
  '',
  'Online/offline/error indicators on avatars.',
  '',
  colorTable(tokensBetween('presence', 'icon')),
);

section(
  '### Surface colors',
  '',
  'Tinted background surfaces used by Schedule events, tags, and badges.',
  'Each color has four sub-tokens: default (background), `fg` (text), `hover`, and',
  '`accent` (dot/indicator).',
  '',
  colorTable(surfaceTokens),
);

section(
  '### Icon colors',
  '',
  'Semantic icon color tokens. Components like Icon use these, but they resolve to',
  'other semantic tokens so overriding the source token is usually sufficient.',
  '',
  colorTable(tokensBetween('icon')),
);

section(
  '---',
  '',
  '### Typography',
  '',
  '#### Fonts',
  '',
  '| Variable | Default |',
  '| --- | --- |',
  '| `--silver-fonts-body` | `system-ui, -apple-system, sans-serif` |',
  '| `--silver-fonts-mono` | `ui-monospace, monospace` |',
  '| `--silver-fonts-sans` | `ui-sans-serif, system-ui, sans-serif, ...` |',
  '| `--silver-fonts-serif` | `ui-serif, Georgia, Cambria, ...` |',
  '',
  '#### Font sizes',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-font-sizes-2xs` | `0.5rem` |',
  '| `--silver-font-sizes-xs` | `0.75rem` |',
  '| `--silver-font-sizes-sm` | `0.875rem` |',
  '| `--silver-font-sizes-md` | `1rem` |',
  '| `--silver-font-sizes-lg` | `1.125rem` |',
  '| `--silver-font-sizes-xl` | `1.25rem` |',
  '| `--silver-font-sizes-2xl` | `1.5rem` |',
  '| `--silver-font-sizes-3xl` | `1.875rem` |',
  '| `--silver-font-sizes-4xl` | `2.25rem` |',
  '| `--silver-font-sizes-5xl` | `3rem` |',
  '| `--silver-font-sizes-6xl` | `3.75rem` |',
  '| `--silver-font-sizes-7xl` | `4.5rem` |',
  '| `--silver-font-sizes-8xl` | `6rem` |',
  '| `--silver-font-sizes-9xl` | `8rem` |',
  '',
  '#### Font weights',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-font-weights-thin` | `100` |',
  '| `--silver-font-weights-extralight` | `200` |',
  '| `--silver-font-weights-light` | `300` |',
  '| `--silver-font-weights-normal` | `400` |',
  '| `--silver-font-weights-medium` | `500` |',
  '| `--silver-font-weights-semibold` | `600` |',
  '| `--silver-font-weights-bold` | `700` |',
  '| `--silver-font-weights-extrabold` | `800` |',
  '| `--silver-font-weights-black` | `900` |',
  '',
  '#### Line heights',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-line-heights-none` | `1` |',
  '| `--silver-line-heights-tight` | `1.25` |',
  '| `--silver-line-heights-snug` | `1.375` |',
  '| `--silver-line-heights-normal` | `1.5` |',
  '| `--silver-line-heights-relaxed` | `1.625` |',
  '| `--silver-line-heights-loose` | `2` |',
  '',
  '#### Letter spacings',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-letter-spacings-tighter` | `-0.05em` |',
  '| `--silver-letter-spacings-tight` | `-0.025em` |',
  '| `--silver-letter-spacings-normal` | `0em` |',
  '| `--silver-letter-spacings-wide` | `0.025em` |',
  '| `--silver-letter-spacings-wider` | `0.05em` |',
  '| `--silver-letter-spacings-widest` | `0.1em` |',
);

section(
  '---',
  '',
  '### Component sizing',
  '',
  'Standardized sizes used across all interactive components (buttons, inputs,',
  'selects, etc.). Override these to change the size system globally.',
  '',
  '#### Heights',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-sizes-component-sm` | `2rem` (32px) |',
  '| `--silver-sizes-component-md` | `2.5rem` (40px) |',
  '| `--silver-sizes-component-lg` | `3rem` (48px) |',
  '',
  '#### Icon sizes',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-sizes-icon-sm` | `1rem` (16px) |',
  '| `--silver-sizes-icon-md` | `1.25rem` (20px) |',
  '| `--silver-sizes-icon-lg` | `1.5rem` (24px) |',
  '',
  '#### Horizontal padding',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-spacing-component-sm` | `0.75rem` (12px) |',
  '| `--silver-spacing-component-md` | `1rem` (16px) |',
  '| `--silver-spacing-component-lg` | `1.25rem` (20px) |',
  '',
  '#### Component font sizes',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-font-sizes-component-sm` | `0.875rem` (14px) |',
  '| `--silver-font-sizes-component-md` | `1rem` (16px) |',
  '| `--silver-font-sizes-component-lg` | `1rem` (16px) |',
);

section(
  '---',
  '',
  '### Border radii',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-radii-xs` | `0.125rem` |',
  '| `--silver-radii-sm` | `0.25rem` |',
  '| `--silver-radii-md` | `0.375rem` |',
  '| `--silver-radii-lg` | `0.5rem` |',
  '| `--silver-radii-xl` | `0.75rem` |',
  '| `--silver-radii-2xl` | `1rem` |',
  '| `--silver-radii-3xl` | `1.5rem` |',
  '| `--silver-radii-full` | `9999px` |',
  '',
  '#### Component radii',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-radii-component-sm` | `0.25rem` |',
  '| `--silver-radii-component-md` | `0.375rem` |',
  '| `--silver-radii-component-lg` | `0.5rem` |',
);

section(
  '---',
  '',
  '### Border widths',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-border-widths-default` | `1px` |',
  '| `--silver-border-widths-emphasized` | `2px` |',
  '| `--silver-border-widths-focus` | `2px` |',
);

section(
  '---',
  '',
  '### Shadows',
  '',
  '#### Elevation',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-shadows-2xs` | `0 1px rgb(0 0 0 / 0.05)` |',
  '| `--silver-shadows-xs` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` |',
  '| `--silver-shadows-sm` | `0 1px 3px 0 rgb(0 0 0 / 0.1), ...` |',
  '| `--silver-shadows-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), ...` |',
  '| `--silver-shadows-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), ...` |',
  '| `--silver-shadows-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), ...` |',
  '| `--silver-shadows-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` |',
  '',
  '#### Focus rings',
  '',
  '| Variable | Description |',
  '| --- | --- |',
  '| `--silver-shadows-focus` | Primary focus ring (uses `primary.subtle`) |',
  '| `--silver-shadows-focus-error` | Error-state focus ring (uses `red.100`) |',
  '| `--silver-shadows-focus-warning` | Warning-state focus ring (uses `yellow.100`) |',
  '| `--silver-shadows-focus-success` | Success-state focus ring (uses `green.100`) |',
);

section(
  '---',
  '',
  '### Focus offset',
  '',
  'Controls the gap between a focused element and its focus ring.',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-spacing-focus-offset` | `2px` |',
  '| `--silver-spacing-focus-offset-tight` | `1px` |',
  '| `--silver-spacing-focus-offset-loose` | `3px` |',
);

section(
  '---',
  '',
  '### Motion',
  '',
  '#### Durations',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-durations-fastest` | `50ms` |',
  '| `--silver-durations-faster` | `100ms` |',
  '| `--silver-durations-fast` | `150ms` |',
  '| `--silver-durations-normal` | `200ms` |',
  '| `--silver-durations-slow` | `300ms` |',
  '| `--silver-durations-slower` | `400ms` |',
  '| `--silver-durations-slowest` | `500ms` |',
  '',
  '#### Easings',
  '',
  '| Variable | Value |',
  '| --- | --- |',
  '| `--silver-easings-default` | `cubic-bezier(0.4, 0, 0.2, 1)` |',
  '| `--silver-easings-linear` | `linear` |',
  '| `--silver-easings-in` | `cubic-bezier(0.4, 0, 1, 1)` |',
  '| `--silver-easings-out` | `cubic-bezier(0, 0, 0.2, 1)` |',
  '| `--silver-easings-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` |',
);

section(
  '---',
  '',
  '### Spacing scale',
  '',
  'The full spacing scale used for margins, padding, and gaps. Only custom values',
  'from `panda.config.ts` are listed above in component sizing; the rest follow the',
  'default Panda CSS spacing scale (`--silver-spacing-0` through',
  '`--silver-spacing-96`).',
);

// ---------------------------------------------------------------------------
// 6. Write files
// ---------------------------------------------------------------------------

// Collect all hex values
const allHexValues = new Set<string>();
for (const [, l, d] of [...semanticTokens, ...surfaceTokens]) {
  allHexValues.add(l.hex);
  allHexValues.add(d.hex);
}
for (const palette of Object.values(palettes)) {
  for (const hex of Object.values(palette)) {
    allHexValues.add(hex);
  }
}

// Generate SVG swatch files
fs.mkdirSync(SWATCH_DIR, {recursive: true});
const expectedSwatchFiles = new Set(
  [...allHexValues].map(hex => swatchFile(hex)),
);
let removedSwatchCount = 0;

for (const entry of fs.readdirSync(SWATCH_DIR, {withFileTypes: true})) {
  if (
    entry.isFile() &&
    entry.name.endsWith('.svg') &&
    !expectedSwatchFiles.has(entry.name)
  ) {
    fs.unlinkSync(path.join(SWATCH_DIR, entry.name));
    removedSwatchCount++;
  }
}

for (const hex of allHexValues) {
  fs.writeFileSync(path.join(SWATCH_DIR, swatchFile(hex)), createSvg(hex));
}

// Write THEME.md
const md = lines.join('\n');
fs.writeFileSync(THEME_PATH, md);
log(
  `Generated ${allHexValues.size} color swatches, removed ` +
    `${removedSwatchCount} unused swatches, and THEME.md`,
);
