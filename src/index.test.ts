import {readFileSync, readdirSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const componentsDir = resolve(here, 'components');
const barrelSource = readFileSync(resolve(here, 'index.ts'), 'utf8');
const internalBarrelSource = readFileSync(
  resolve(here, 'internal', 'index.ts'),
  'utf8',
);
const readmeSource = readFileSync(resolve(here, '..', 'README.md'), 'utf8');

// Matches one member (`Name` or `type Name`) re-exported from the given
// component barrel path, without depending on member order inside the export
// block, so alphabetizing or splitting the statement cannot break the test.
function barrelExportPattern(componentPath: string, member: string): RegExp {
  return new RegExp(
    String.raw`export\s*\{[^}]*\b${member}\b[^}]*\}\s*from\s*'components/${componentPath}'`,
    's',
  );
}

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

// Components promoted from `internal` whose public surface (value plus types)
// must come from the component barrel and stay out of the internal barrel.
describe.each([
  {
    component: 'VisuallyHidden',
    members: ['VisuallyHidden', 'type VisuallyHiddenProps'],
  },
  {
    component: 'OverflowList',
    members: ['OverflowList', 'type OverflowItem', 'type OverflowListProps'],
  },
])('$component public export', ({component, members}) => {
  it('re-exports the component and its public types', () => {
    for (const member of members) {
      expect(barrelSource).toMatch(barrelExportPattern(component, member));
    }
  });

  it('does not surface it through the internal barrel', () => {
    expect(internalBarrelSource).not.toContain(component);
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
