import {componentCategories} from '../../src/component-categories';
import type {ComponentDocData} from './types';

/**
 * The /components/ overview page: every component grouped by category, with
 * its one-line description. Emitted as plain markdown.
 */
export function componentsIndexMd(all: ComponentDocData[]): string {
  const byName = new Map(all.map(data => [data.name, data]));
  const lines: string[] = [
    '---',
    'title: "Components"',
    `description: "The ${all.length} components of silver-ui, grouped by category — each with live examples and full props documentation."`,
    '---',
    '',
    `silver-ui ships ${all.length} components. Every page shows live examples`,
    'with copyable code and the complete props API, generated from the source.',
  ];
  for (const [category, names] of Object.entries(componentCategories)) {
    lines.push('', `## ${category}`, '');
    for (const name of [...names].sort()) {
      const data = byName.get(name);
      if (data == null) {
        continue;
      }
      const description = data.description.replace(/\.$/, '');
      lines.push(`- [${name}](/components/${data.slug}/) — ${description}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}
