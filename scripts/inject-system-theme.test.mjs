import {readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {injectSystemThemeCss} from './inject-system-theme.mjs';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(
  readFileSync(join(scriptsDir, '..', 'package.json'), 'utf8'),
);

// A trimmed stand-in for Panda's generated `styles.css`: the base token block,
// an explicit dark block, and an unrelated trailing rule. Includes a
// `color-mix(...)` value (commas + parens, no braces) to exercise parsing.
const SAMPLE_CSS = [
  '@layer tokens{',
  ':where(:root,:host){',
  '--silver-colors-bg:var(--silver-colors-white);',
  '--silver-colors-fg:var(--silver-colors-gray-900);',
  '--silver-colors-primary-subtle:var(--silver-colors-teal-100);',
  '--silver-radii-md:0.375rem;',
  '}',
  ':where([data-theme=dark]){',
  '--silver-colors-bg:var(--silver-colors-gray-900);',
  '--silver-colors-fg:var(--silver-colors-gray-50);',
  '--silver-colors-primary-subtle:color-mix(in srgb, var(--silver-colors-primary) 45%, transparent);',
  '}',
  '}',
  '@layer utilities{.text-fg{color:var(--silver-colors-fg)}}',
].join('');

function mediaSystemBlock(css) {
  return /@media \(prefers-color-scheme:dark\)\{:where\(\[data-theme=system\]\)\{([^}]*)\}\}/.exec(
    css,
  )?.[1];
}

function lightBlock(css) {
  return /:where\(\[data-theme=light\]\)\{([^}]*)\}/.exec(css)?.[1];
}

describe('injectSystemThemeCss', () => {
  it('mirrors the dark block into a prefers-color-scheme media query for system mode', () => {
    const out = injectSystemThemeCss(SAMPLE_CSS);
    const system = mediaSystemBlock(out);

    expect(system).toBeDefined();
    // System mode gets exactly the dark values.
    expect(system).toContain(
      '--silver-colors-bg:var(--silver-colors-gray-900)',
    );
    expect(system).toContain('--silver-colors-fg:var(--silver-colors-gray-50)');
    expect(system).toContain(
      '--silver-colors-primary-subtle:color-mix(in srgb, var(--silver-colors-primary) 45%, transparent)',
    );
  });

  it('resets the dark-overridden tokens to their base values under an explicit light theme', () => {
    const out = injectSystemThemeCss(SAMPLE_CSS);
    const light = lightBlock(out);

    expect(light).toBeDefined();
    expect(light).toContain('--silver-colors-bg:var(--silver-colors-white)');
    expect(light).toContain('--silver-colors-fg:var(--silver-colors-gray-900)');
    expect(light).toContain(
      '--silver-colors-primary-subtle:var(--silver-colors-teal-100)',
    );
    // Only tokens the dark theme overrides are reset — untouched base tokens
    // (e.g. radii) are not duplicated into the light block.
    expect(light).not.toContain('--silver-radii-md');
  });

  it('preserves the original stylesheet and appends after it', () => {
    const out = injectSystemThemeCss(SAMPLE_CSS);

    expect(out.startsWith(SAMPLE_CSS)).toBe(true);
    expect(out).toContain('@layer utilities{.text-fg');
  });

  it('is idempotent', () => {
    const once = injectSystemThemeCss(SAMPLE_CSS);
    expect(injectSystemThemeCss(once)).toBe(once);
  });

  it('handles pretty-printed (unminified) CSS', () => {
    const pretty = [
      '@layer tokens {',
      '  :where(:root, :host) {',
      '    --silver-colors-bg: var(--silver-colors-white);',
      '  }',
      '  :where([data-theme=dark]) {',
      '    --silver-colors-bg: var(--silver-colors-gray-900);',
      '  }',
      '}',
    ].join('\n');

    const system = mediaSystemBlock(injectSystemThemeCss(pretty));
    expect(system).toContain(
      '--silver-colors-bg:var(--silver-colors-gray-900)',
    );
  });

  it('throws when the base token block is missing', () => {
    expect(() =>
      injectSystemThemeCss(
        ':where([data-theme=dark]){--silver-colors-bg:#000}',
      ),
    ).toThrow(/root/);
  });

  it('throws when the dark token block is missing', () => {
    expect(() =>
      injectSystemThemeCss(':where(:root,:host){--silver-colors-bg:#fff}'),
    ).toThrow(/data-theme=dark/);
  });

  it('throws when the dark token block is empty', () => {
    expect(() =>
      injectSystemThemeCss(
        ':where(:root,:host){--silver-colors-bg:#fff}:where([data-theme=dark]){}',
      ),
    ).toThrow(/empty/);
  });

  it('is wired into the build after the Panda cssgen step', () => {
    const build = packageJson.scripts.build;
    expect(build).toContain('scripts/inject-system-theme.mjs');
    expect(build.indexOf('panda cssgen')).toBeLessThan(
      build.indexOf('scripts/inject-system-theme.mjs'),
    );
  });
});
