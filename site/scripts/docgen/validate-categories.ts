import {componentCategories} from '../../src/component-categories';

/**
 * Fails the build unless the category map and src/components are exactly in
 * sync: every component directory appears in exactly one category, and every
 * mapped name has a directory. Keeping this a hard error is what makes "add
 * one line to component-categories.ts" the only manual docs step.
 */
export function validateCategories(componentDirs: readonly string[]): void {
  const seen = new Map<string, string>();
  const problems: string[] = [];

  for (const [category, names] of Object.entries(componentCategories)) {
    for (const name of names) {
      const existing = seen.get(name);
      if (existing != null) {
        problems.push(
          `"${name}" is listed in both "${existing}" and "${category}"`,
        );
      }
      seen.set(name, category);
      if (!componentDirs.includes(name)) {
        problems.push(
          `"${name}" (in "${category}") has no src/components/${name}/ directory`,
        );
      }
    }
  }

  for (const dir of componentDirs) {
    if (!seen.has(dir)) {
      problems.push(
        `src/components/${dir} is not categorized — add it to a category in site/src/component-categories.ts`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `docgen: component category map is out of sync:\n  ${problems.join('\n  ')}`,
    );
  }
}
