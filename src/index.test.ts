import {readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(here, 'components');
const barrelSource = readFileSync(resolve(here, 'index.ts'), 'utf8');
const readmeSource = readFileSync(resolve(here, '..', 'README.md'), 'utf8');

// Components that are exported but intentionally not in the README "Components"
// list because they are documented elsewhere.
const DOCUMENTED_ELSEWHERE = new Set([
  'Theme', // covered by the README "Theming" section
]);

// Every non-internal component lives in a directory under `src/components`.
const componentDirs = readdirSync(componentsDir, {withFileTypes: true})
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();

// Bolded component names from the README "Components" bullet list. Entries like
// `**Text / Heading**` are split so each name is matched individually.
const readmeComponentNames = new Set<string>();
for (const match of readmeSource.matchAll(/^- \*\*(.+?)\*\*/gm)) {
  for (const name of match[1].split('/')) {
    readmeComponentNames.add(name.trim());
  }
}

// Value (non-type) identifiers re-exported from a component's `index.ts`.
function valueExports(source: string): string[] {
  const names: string[] = [];
  for (const block of source.matchAll(/export\s*\{([^}]*)\}/g)) {
    for (const part of block[1].split(',')) {
      const entry = part.trim();
      if (entry === '' || entry.startsWith('type ')) {
        continue;
      }
      // Handle `Original as Alias` — the public name is the alias.
      const aliased = / as (\w+)$/.exec(entry);
      names.push(aliased ? aliased[1] : entry);
    }
  }
  return names;
}

describe('VisuallyHidden public export', () => {
  it('re-exports the VisuallyHidden value and VisuallyHiddenProps type', () => {
    // The re-export must come from the public component barrel, not `internal`.
    expect(barrelSource).toMatch(
      /export\s*\{[^}]*\bVisuallyHidden\b[^}]*\btype VisuallyHiddenProps\b[^}]*\}\s*from\s*'components\/VisuallyHidden'/s,
    );
  });

  it('does not surface VisuallyHidden through the internal barrel', () => {
    const internalBarrel = readFileSync(
      resolve(here, 'internal', 'index.ts'),
      'utf8',
    );
    expect(internalBarrel).not.toContain('VisuallyHidden');
  });
});

describe('public exports', () => {
  it('does not re-export symbols from internal modules', () => {
    expect(barrelSource).not.toMatch(/\bfrom\s*['"]internal(?:\/[^'"]*)?['"]/);
  });

  it('re-exports AvatarColor from the root barrel', () => {
    expect(barrelSource).toMatch(
      /export\s*\{[^}]*\btype AvatarColor\b[^}]*\}\s*from\s*'components\/Avatar'/s,
    );
  });
});

describe('component barrel and docs coverage', () => {
  it('finds component directories to check', () => {
    expect(componentDirs.length).toBeGreaterThan(0);
  });

  describe.each(componentDirs)('%s', dir => {
    it('is re-exported from src/index.ts', () => {
      expect(barrelSource).toContain(`from 'components/${dir}'`);
    });

    it('is listed in the README', () => {
      if (DOCUMENTED_ELSEWHERE.has(dir)) {
        return;
      }
      // A component matches if its directory name or any of its public value
      // exports appears as a bolded entry in the README component list.
      const candidates = [
        dir,
        ...valueExports(
          readFileSync(resolve(componentsDir, dir, 'index.ts'), 'utf8'),
        ),
      ];
      const listed = candidates.some(name => readmeComponentNames.has(name));
      if (!listed) {
        throw new Error(
          `Component "${dir}" is not listed in the README "Components" ` +
            `section. Add a "- **${dir}** — ..." entry, or add it to ` +
            `DOCUMENTED_ELSEWHERE.`,
        );
      }
      expect(listed).toBe(true);
    });
  });
});
