import {mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {categoryOf, componentSlug} from '../../src/component-categories';
import {
  createLibraryProgram,
  extractComponentExports,
  hasComponentIndex,
} from './extract-props';
import {
  extractStoriesFile,
  storyFilesOf,
  type StoriesFileDoc,
} from './extract-stories';
import {demosModule} from './generate-demos';
import {componentMdx} from './generate-mdx';
import {componentsIndexMd} from './generate-index';
import {gettingStartedPage, syncSwatches, themingPage} from './import-guides';
import {readmeDescriptions} from './readme-descriptions';
import type {ComponentDocData} from './types';
import {validateCategories} from './validate-categories';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const siteSrc = join(repoRoot, 'site/src');
const propsOutDir = join(siteSrc, 'generated/props');
const demosOutDir = join(siteSrc, 'generated/demos');
const mdxOutDir = join(siteSrc, 'content/docs/components');

function listComponentDirs(): string[] {
  return readdirSync(join(repoRoot, 'src/components'), {withFileTypes: true})
    .filter(entry => entry.isDirectory() && hasComponentIndex(entry.name))
    .map(entry => entry.name)
    .sort();
}

export function runDocgen(): void {
  const started = performance.now();
  const components = listComponentDirs();
  validateCategories(components);

  const fallbackDescriptions = readmeDescriptions();
  const program = createLibraryProgram(components);

  const problems: string[] = [];
  const generated: Array<{
    data: ComponentDocData;
    storyFiles: StoriesFileDoc[];
  }> = [];
  for (const name of components) {
    const exports = extractComponentExports(program, name);
    const storyFiles = storyFilesOf(name).map(file =>
      extractStoriesFile(name, file),
    );
    if (exports.length === 0) {
      problems.push(
        `${name}: no documented exports — expected at least one exported component with a paired <Name>Props type export`,
      );
      continue;
    }
    const primary = exports.find(exported => exported.name === name);
    // README bullets are sentence fragments ("versatile action element…");
    // normalize them into a sentence when used as the page description.
    const fallback = fallbackDescriptions.get(name);
    const fallbackSentence =
      fallback == null
        ? undefined
        : `${fallback[0].toUpperCase()}${fallback.slice(1)}${fallback.endsWith('.') ? '' : '.'}`;
    const description =
      primary?.description || exports[0].description || fallbackSentence || '';
    if (description === '') {
      problems.push(
        `${name}: no description — add a JSDoc summary to the ${name} component (or its ${name}Props type)`,
      );
      continue;
    }
    generated.push({
      data: {
        name,
        slug: componentSlug(name),
        category: categoryOf(name) ?? '',
        description,
        exports,
      },
      storyFiles,
    });
  }

  if (problems.length > 0) {
    throw new Error(`docgen: extraction failed:\n  ${problems.join('\n  ')}`);
  }

  // Regenerate output directories from scratch so pages for removed
  // components disappear instead of lingering.
  rmSync(propsOutDir, {recursive: true, force: true});
  rmSync(demosOutDir, {recursive: true, force: true});
  rmSync(mdxOutDir, {recursive: true, force: true});
  mkdirSync(propsOutDir, {recursive: true});
  mkdirSync(demosOutDir, {recursive: true});
  mkdirSync(mdxOutDir, {recursive: true});

  for (const {data, storyFiles} of generated) {
    writeFileSync(
      join(propsOutDir, `${data.name}.json`),
      `${JSON.stringify(data, null, 2)}\n`,
    );
    const withStories = storyFiles.filter(file => file.stories.length > 0);
    if (withStories.length > 0) {
      writeFileSync(
        join(demosOutDir, `${data.name}.tsx`),
        demosModule(data.name, withStories),
      );
    }
    writeFileSync(
      join(mdxOutDir, `${data.slug}.mdx`),
      componentMdx(data, storyFiles),
    );
  }
  writeFileSync(
    join(mdxOutDir, 'index.md'),
    componentsIndexMd(generated.map(({data}) => data)),
  );

  // Guides are single-sourced from the repo's README.md and THEME.md.
  writeFileSync(
    join(siteSrc, 'content/docs/getting-started.md'),
    gettingStartedPage(),
  );
  writeFileSync(join(siteSrc, 'content/docs/theming.md'), themingPage());
  syncSwatches();

  const elapsed = ((performance.now() - started) / 1000).toFixed(1);
  process.stdout.write(
    `docgen: generated ${generated.length} component pages in ${elapsed}s\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDocgen();
}
