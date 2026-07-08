import {describe, expect, it} from 'vitest';

import {themePresets} from 'themes/presets';

// panda.config.ts lives at the repo root (outside src) and has no path alias;
// this test intentionally reads the real token source of truth.
// eslint-disable-next-line no-restricted-imports
import config from '../../panda.config';

/**
 * Guards the color-contrast of every "solid fill + foreground" token pairing
 * that carries text, in both light and dark mode, against the WCAG 2.1 AA
 * threshold for normal-size text (4.5:1).
 *
 * The pairings are resolved from the *actual* Panda config (`panda.config.ts`),
 * so this test tracks the real source of truth with no duplicated hex values.
 * Added for issue #1 (the primary button's white-on-teal was 3.06:1); the same
 * audit also caught the warning, neutral, info, and dark-mode success solids.
 */

const AA_NORMAL = 4.5;

type Mode = 'base' | '_dark';
type ValueExpr = string | {base?: string; _dark?: string};
type TokenNode = {value?: ValueExpr} & {[key: string]: unknown};

const themeExtend = config.theme?.extend;
const rawColors = (themeExtend?.tokens?.colors ?? {}) as unknown as Record<
  string,
  Record<string, {value: string} | undefined> | undefined
>;
const semantic = (themeExtend?.semanticTokens?.colors ??
  {}) as unknown as Record<string, unknown>;

// Panda ships these base colors; they are not declared in our token config.
const builtinColors: Record<string, string | undefined> = {
  white: '#ffffff',
  black: '#000000',
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function lookupSemantic(parts: string[]): TokenNode | undefined {
  let node: unknown = semantic;
  for (const part of parts) {
    if (isObject(node) && part in node) {
      node = node[part];
    } else {
      return undefined;
    }
  }
  return isObject(node) ? node : undefined;
}

/**
 * Resolve a `{colors.x.y}` token reference (or a raw hex) to a concrete hex
 * value for the given mode. Follows semantic -> semantic chains (e.g.
 * `status.info.solidFg` -> `fg.onPrimary` -> `white`) and treats a bare group
 * reference (`{colors.primary}`) as its `DEFAULT`.
 */
function resolve(ref: string, mode: Mode): string {
  if (ref.startsWith('#')) {
    return ref;
  }

  const inner = ref.replace(/^\{colors\./, '').replace(/\}$/, '');
  const parts = inner.split('.');

  let node = lookupSemantic(parts);
  // `{colors.primary}` means `primary.DEFAULT`.
  if (node && node.value === undefined && isObject(node.DEFAULT)) {
    node = node.DEFAULT;
  }
  if (node?.value !== undefined) {
    const raw = node.value;
    const expr = typeof raw === 'string' ? raw : (raw[mode] ?? raw.base);
    if (expr === undefined) {
      throw new Error(`Missing ${mode} value for reference: ${ref}`);
    }
    return resolve(expr, mode);
  }

  const scale = parts.length === 2 ? rawColors[parts[0]] : undefined;
  const swatch = scale?.[parts[1]];
  if (swatch) {
    return swatch.value;
  }
  const builtin = parts.length === 1 ? builtinColors[parts[0]] : undefined;
  if (builtin) {
    return builtin;
  }
  throw new Error(`Unable to resolve color reference: ${ref}`);
}

function relativeLuminance(hex: string): number {
  const channels = [1, 3, 5]
    .map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const SURFACE_COLORS = [
  'blue',
  'cyan',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
] as const;

// Every text-bearing solid fill paired with its intended foreground.
// status.disabled.solid is intentionally omitted: WCAG 2.1 SC 1.4.3 exempts
// inactive/disabled UI components from the contrast requirement.
const PAIRINGS: {name: string; bg: string; fg: string}[] = [
  {name: 'primary button', bg: '{colors.primary}', fg: '{colors.fg.onPrimary}'},
  {
    name: 'destructive button',
    bg: '{colors.destructive}',
    fg: '{colors.destructive.fg}',
  },
  ...(['success', 'error', 'warning', 'info', 'neutral'] as const).map(s => ({
    name: `status.${s} solid`,
    bg: `{colors.status.${s}.solid}`,
    fg: `{colors.status.${s}.solidFg}`,
  })),
  ...SURFACE_COLORS.map(c => ({
    name: `surface.${c} tint`,
    bg: `{colors.surface.${c}.DEFAULT}`,
    fg: `{colors.surface.${c}.fg}`,
  })),
];

const MODES: Mode[] = ['base', '_dark'];

describe('token color contrast (WCAG AA, normal text)', () => {
  it.each(PAIRINGS.flatMap(p => MODES.map(mode => ({...p, mode}))))(
    '$name meets 4.5:1 in $mode mode',
    ({bg, fg, mode}) => {
      const bgHex = resolve(bg, mode);
      const fgHex = resolve(fg, mode);
      const ratio = contrastRatio(bgHex, fgHex);
      expect(
        ratio,
        `${fg} (${fgHex}) on ${bg} (${bgHex}) is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    },
  );
});

// ---------------------------------------------------------------------------
// Bundled theme presets (`<Theme preset=…>`). We ship and encourage these, so
// they get the same audit. A preset only overrides a subset of tokens; any
// pairing it does not override falls back to the (already-audited) default
// token, so each pairing is resolved override-first, default-second.
// ---------------------------------------------------------------------------

type Preset = (typeof themePresets)[keyof typeof themePresets];
type Appearance = 'light' | 'dark';

// Panda token path -> flat camelCase `<Theme>` override key.
function presetKey(ref: string): string {
  const parts = ref
    .replace(/^\{colors\./, '')
    .replace(/\}$/, '')
    .split('.')
    .filter(part => part !== 'DEFAULT');
  return parts
    .map((part, i) => (i === 0 ? part : part[0].toUpperCase() + part.slice(1)))
    .join('');
}

function presetOverride(
  preset: Preset,
  appearance: Appearance,
  key: string,
): string | undefined {
  const modeColors = preset.themes?.[appearance]?.colors as unknown as
    Record<string, string | undefined> | undefined;
  const agnostic = preset.tokens?.colors as unknown as
    Record<string, string | undefined> | undefined;
  return modeColors?.[key] ?? agnostic?.[key];
}

// Effective hex for a token in a preset: its override, else the default.
function effective(
  preset: Preset,
  appearance: Appearance,
  ref: string,
  mode: Mode,
): string {
  return (
    presetOverride(preset, appearance, presetKey(ref)) ?? resolve(ref, mode)
  );
}

// Opaque `#rrggbb` only; translucent colors need compositing to judge.
function isOpaqueHex(color: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(color);
}

/**
 * Pairings kept intentionally faithful to their source palette even though the
 * on-accent text falls short of AA. Verified against the official palettes
 * (nordtheme.com, ethanschoonover.com/solarized) — every accent below is the
 * exact canonical value. Keyed `${preset}:${mode}:${pairing}`; the pinned hex
 * makes this exemption break loudly if the color ever drifts (at which point
 * it should either pass AA or be reconsidered, not silently re-exempted).
 */
const CANONICAL_EXCEPTIONS: Record<
  string,
  {bg: string; source: string} | undefined
> = {
  'nord:base:primary button': {bg: '#5e81ac', source: 'Nord nord10'},
  'nord:base:status.info solid': {bg: '#5e81ac', source: 'Nord nord10'},
  'nord:base:destructive button': {bg: '#bf616a', source: 'Nord nord11'},
  'nord:_dark:destructive button': {bg: '#bf616a', source: 'Nord nord11'},
  'solarized:base:primary button': {bg: '#268bd2', source: 'Solarized blue'},
  'solarized:_dark:primary button': {bg: '#268bd2', source: 'Solarized blue'},
  'solarized:base:status.info solid': {bg: '#268bd2', source: 'Solarized blue'},
  'solarized:_dark:status.info solid': {
    bg: '#268bd2',
    source: 'Solarized blue',
  },
  'solarized:base:destructive button': {bg: '#dc322f', source: 'Solarized red'},
  'solarized:_dark:destructive button': {
    bg: '#dc322f',
    source: 'Solarized red',
  },
};

interface PresetCase {
  appearance: Appearance;
  bgHex: string;
  fgHex: string;
  mode: Mode;
  name: string;
  preset: string;
}

const PRESET_CASES: PresetCase[] = Object.entries(themePresets)
  .flatMap(([presetId, preset]) =>
    MODES.flatMap(mode => {
      const appearance: Appearance = mode === '_dark' ? 'dark' : 'light';
      return PAIRINGS.map(p => ({
        appearance,
        bgHex: effective(preset, appearance, p.bg, mode),
        fgHex: effective(preset, appearance, p.fg, mode),
        mode,
        name: p.name,
        preset: presetId,
      }));
    }),
  )
  .filter(c => isOpaqueHex(c.bgHex) && isOpaqueHex(c.fgHex));

const exceptionFor = (c: PresetCase) =>
  CANONICAL_EXCEPTIONS[`${c.preset}:${c.mode}:${c.name}`];

const ENFORCED_CASES = PRESET_CASES.filter(c => exceptionFor(c) === undefined);
const EXEMPT_CASES = PRESET_CASES.map(c => ({
  ...c,
  expected: exceptionFor(c)?.bg,
  source: exceptionFor(c)?.source,
})).filter(c => c.expected !== undefined);

describe('theme preset color contrast (WCAG AA, normal text)', () => {
  it.each(ENFORCED_CASES)(
    '$preset · $name in $appearance mode',
    ({bgHex, fgHex, name, preset}) => {
      const ratio = contrastRatio(bgHex, fgHex);
      expect(
        ratio,
        `${preset} ${name}: ${fgHex} on ${bgHex} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(AA_NORMAL);
    },
  );
});

describe('theme preset canonical exceptions (faithful to source palette)', () => {
  it.each(EXEMPT_CASES)(
    '$preset · $name stays canonical in $appearance mode',
    ({bgHex, expected, name, preset, source}) => {
      expect(
        bgHex.toLowerCase(),
        `${preset} ${name} should stay ${source} (${expected})`,
      ).toBe(expected);
    },
  );
});
