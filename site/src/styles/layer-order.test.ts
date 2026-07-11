import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

/**
 * The docs pages stack two layered stylesheets: Panda's (the component styles)
 * and Starlight's (the page chrome and prose). A cascade layer's position is
 * fixed the first time its name is seen, so whichever sheet loads first wins
 * the ordering by accident — and by default that puts every `starlight.*`
 * layer above every Panda one, letting Starlight's `* { margin: 0 }` reset
 * beat Panda's margin utilities inside the live demos.
 *
 * layers.css settles it explicitly. These tests pin the two properties that
 * make it work, either of which a dependency bump or a config edit could break
 * silently — the demos would just quietly render wrong.
 */

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const layersCss = readFileSync(
  resolve(siteRoot, 'src/styles/layers.css'),
  'utf-8',
);
const astroConfig = readFileSync(resolve(siteRoot, 'astro.config.ts'), 'utf-8');

/**
 * The layer names, in order, from a `@layer a, b, c;` statement.
 */
function layerStatement(css: string): string[] {
  const match = /@layer\s+([^{;]+);/.exec(css);
  if (match == null) {
    throw new Error('no @layer statement found');
  }
  return match[1]
    .split(',')
    .map(name => name.trim())
    .filter(name => name !== '');
}

const ourOrder = layerStatement(layersCss);

describe('docs cascade layer order', () => {
  it('ranks Panda recipes and utilities above every Starlight layer', () => {
    const lastStarlight = ourOrder.findLastIndex(name =>
      name.startsWith('starlight.'),
    );
    expect(lastStarlight).toBeGreaterThan(-1);
    for (const name of ['recipes', 'utilities']) {
      expect(ourOrder.indexOf(name)).toBeGreaterThan(lastStarlight);
    }
  });

  it('keeps Panda global layers below Starlight, so the docs stay styled', () => {
    const firstStarlight = ourOrder.findIndex(name =>
      name.startsWith('starlight.'),
    );
    for (const name of ['reset', 'base', 'tokens']) {
      const index = ourOrder.indexOf(name);
      expect(index).toBeGreaterThan(-1);
      expect(index).toBeLessThan(firstStarlight);
    }
  });

  /**
   * A layer this statement forgets to name is registered on first use and
   * lands *last* — above `utilities`, undoing the fix. Starlight declares its
   * own order in style/layers.css, so read the installed copy: a version that
   * adds a layer fails here rather than in the rendered demos.
   */
  it('names every layer the installed Starlight declares', () => {
    const require = createRequire(import.meta.url);
    // layers.css sits beside markdown.css, which is the only stylesheet
    // Starlight's export map exposes by name.
    const starlightStyleDir = dirname(
      require.resolve('@astrojs/starlight/style/markdown.css'),
    );
    const starlightLayers = layerStatement(
      readFileSync(resolve(starlightStyleDir, 'layers.css'), 'utf-8'),
    );
    expect(starlightLayers.length).toBeGreaterThan(0);
    for (const name of starlightLayers) {
      expect(ourOrder).toContain(name);
    }
  });

  /**
   * Panda's own layer names, from the library's shared config. Renaming one
   * there without renaming it here would drop that layer out of the statement.
   */
  it('names every Panda layer', () => {
    for (const name of ['reset', 'base', 'tokens', 'recipes', 'utilities']) {
      expect(ourOrder).toContain(name);
    }
  });

  it('loads layers.css before the stylesheets whose layers it orders', () => {
    const customCss = /customCss:\s*\[([^\]]*)\]/s.exec(astroConfig);
    expect(customCss).not.toBeNull();
    const files = [...(customCss?.[1].matchAll(/'([^']+)'/g) ?? [])].map(
      match => match[1],
    );
    expect(files[0]).toBe('./src/styles/layers.css');
    expect(files).toContain('./src/styles/panda.css');
  });
});
