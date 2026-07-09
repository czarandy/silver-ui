import type {ComponentDocData} from './types';

/**
 * Renders the MDX shell for one component page. All heavy rendering lives in
 * the committed Astro components; the generated MDX only carries frontmatter
 * (title/description for SEO) and the section headings, which Starlight needs
 * in the markdown itself to build the page's table of contents.
 */
export function componentMdx(data: ComponentDocData): string {
  const lines: string[] = [
    '---',
    `title: ${JSON.stringify(data.name)}`,
    `description: ${JSON.stringify(data.description)}`,
    '---',
    '',
    "import ComponentDoc from '../../../components/ComponentDoc.astro';",
    "import PropsTable from '../../../components/PropsTable.astro';",
    '',
    `<ComponentDoc name=${JSON.stringify(data.name)} />`,
    '',
    '## API',
  ];
  for (const exported of data.exports) {
    lines.push(
      '',
      `### ${exported.name}`,
      '',
      `<PropsTable component=${JSON.stringify(data.name)} exportName=${JSON.stringify(exported.name)} />`,
    );
  }
  lines.push('');
  return lines.join('\n');
}
