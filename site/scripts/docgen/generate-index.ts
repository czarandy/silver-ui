import {componentCategories} from '../../src/component-categories';
import {firstSentence} from './first-sentence';
import type {ComponentDocData} from './types';

/**
 * The /components/ overview page: every component grouped by category, with
 * its one-line description. Emitted as plain markdown.
 */
export function componentsIndexMd(all: ComponentDocData[]): string {
  const componentCount = new Set(all.map(data => data.sourceName)).size;
  const lines: string[] = [
    '---',
    'title: "Components"',
    `description: "The ${componentCount} components of silver-ui, grouped by category — each with live examples and full props documentation."`,
    '---',
    '',
    `silver-ui ships ${componentCount} components. Every page shows live examples`,
    'with copyable code and the complete props API, generated from the source.',
  ];
  for (const category of Object.keys(componentCategories)) {
    lines.push('', `## ${category}`, '');
    const pages = all
      .filter(data => data.category === category)
      .sort((a, b) => a.label.localeCompare(b.label));
    for (const data of pages) {
      const description = firstSentence(data.description).replace(/\.$/, '');
      lines.push(
        `- [${data.label}](/components/${data.slug}/) — ${description}`,
      );
    }
  }
  lines.push('');
  return lines.join('\n');
}
