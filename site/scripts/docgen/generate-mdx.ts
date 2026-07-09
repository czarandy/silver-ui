import {isClientOnly} from './demo-exceptions';
import type {StoriesFileDoc} from './extract-stories';
import type {ComponentDocData} from './types';

/**
 * Renders the MDX shell for one component page. All heavy rendering lives in
 * the committed Astro components; the generated MDX carries the frontmatter
 * (title/description for SEO), the live demo islands with their code
 * snippets, and the section headings, which Starlight needs in the markdown
 * itself to build the page's table of contents.
 */
export function componentMdx(
  data: ComponentDocData,
  storyFiles: StoriesFileDoc[] = [],
): string {
  const lines: string[] = [
    '---',
    `title: ${JSON.stringify(data.name)}`,
    `description: ${JSON.stringify(data.description)}`,
    '---',
    '',
    "import ComponentDoc from '../../../components/ComponentDoc.astro';",
    "import PropsTable from '../../../components/PropsTable.astro';",
  ];
  const withStories = storyFiles.filter(file => file.stories.length > 0);
  if (withStories.length > 0) {
    const demoImports = withStories
      .map(({file}) => `${file}Stories`)
      .join(', ');
    lines.push(
      `import {${demoImports}} from '../../../generated/demos/${data.name}';`,
    );
  }
  lines.push('', `<ComponentDoc name=${JSON.stringify(data.name)} />`);

  for (const {file, stories} of withStories) {
    lines.push('', file === data.name ? '## Examples' : `## ${file} examples`);
    for (const story of stories) {
      if (story.snippet.includes('```')) {
        throw new Error(
          `docgen: ${data.name}/${file}#${story.exportName}: snippet contains a code fence`,
        );
      }
      const directive = isClientOnly(data.name, file, story.exportName)
        ? 'client:only="react"'
        : 'client:visible';
      lines.push(
        '',
        `### ${story.displayName}`,
        '',
        '<div class="component-preview not-content" data-component-preview>',
        `  <${file}Stories story=${JSON.stringify(story.exportName)} ${directive} />`,
        '</div>',
        '',
        '```tsx',
        story.snippet,
        '```',
      );
    }
  }

  lines.push('', '## API');
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
