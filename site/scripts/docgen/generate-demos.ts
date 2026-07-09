import type {StoriesFileDoc} from './extract-stories';

/**
 * Renders the generated demos module for one component page: it statically
 * imports the component's `*.stories.tsx` files and wraps each in a
 * `StoryDemo` component. Static imports keep the demos server-renderable and
 * let each page's island chunk contain only its own stories.
 */
export function demosModule(
  componentName: string,
  files: StoriesFileDoc[],
): string {
  const lines: string[] = [];
  files.forEach(({file}, index) => {
    lines.push(
      `import * as stories${index} from 'components/${componentName}/${file}.stories';`,
    );
  });
  lines.push(
    "import {createStoryDemo} from '../../components/create-story-demo';",
    '',
  );
  files.forEach(({file}, index) => {
    lines.push(
      `export const ${file}Stories = createStoryDemo(stories${index});`,
    );
  });
  lines.push('');
  return lines.join('\n');
}
