import {mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {
  categoryOf,
  componentDocPages,
  componentSlug,
} from '../../src/component-categories';
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
  const exportsByComponent = new Map(
    components.map(sourceName => [
      sourceName,
      extractComponentExports(program, sourceName),
    ]),
  );
  const publicComponentNames = new Set(
    [...exportsByComponent.values()].flatMap(exports =>
      exports.map(exported => exported.name),
    ),
  );

  const problems: string[] = [];
  const generated: Array<{
    data: ComponentDocData;
    storyFiles: StoriesFileDoc[];
  }> = [];
  for (const sourceName of components) {
    const exports = exportsByComponent.get(sourceName) ?? [];
    if (exports.length === 0) {
      problems.push(
        `${sourceName}: no documented exports — expected at least one exported component with a paired <Name>Props type export`,
      );
      continue;
    }
    const storyFiles = storyFilesOf(sourceName).map(file =>
      extractStoriesFile(sourceName, file, publicComponentNames),
    );

    const exportByName = new Map(
      exports.map(exported => [exported.name, exported]),
    );
    const storyFileByName = new Map(
      storyFiles.map(storyFile => [storyFile.file, storyFile]),
    );
    const pages = componentDocPages(sourceName);
    const isSplit = pages.some(
      page => page.exportNames != null || page.storyFiles != null,
    );
    const assignedExports = new Set<string>();
    const assignedStoryFiles = new Set<string>();

    for (const page of pages) {
      const pageExports =
        page.exportNames == null
          ? exports
          : page.exportNames.flatMap(exportName => {
              const exported = exportByName.get(exportName);
              if (exported == null) {
                problems.push(
                  `${sourceName}/${page.name}: unknown export "${exportName}"`,
                );
                return [];
              }
              if (assignedExports.has(exportName)) {
                problems.push(
                  `${sourceName}: export "${exportName}" is assigned to more than one docs page`,
                );
              }
              assignedExports.add(exportName);
              return [exported];
            });
      const pageStoryFiles =
        page.storyFiles == null
          ? storyFiles
          : page.storyFiles.flatMap(file => {
              const storyFile = storyFileByName.get(file);
              if (storyFile == null) {
                problems.push(
                  `${sourceName}/${page.name}: unknown stories file "${file}"`,
                );
                return [];
              }
              if (assignedStoryFiles.has(file)) {
                problems.push(
                  `${sourceName}: stories file "${file}" is assigned to more than one docs page`,
                );
              }
              assignedStoryFiles.add(file);
              return [storyFile];
            });

      if (pageExports.length === 0) {
        problems.push(`${sourceName}/${page.name}: no documented exports`);
        continue;
      }

      const primary = pageExports.find(exported => exported.name === page.name);
      // README bullets are sentence fragments ("versatile action element…");
      // normalize them into a sentence when used as the page description. A
      // combined bullet (e.g. "HStack / VStack") is looked up via the page
      // label's first component name.
      const fallback =
        fallbackDescriptions.get(page.name) ??
        fallbackDescriptions.get(sourceName) ??
        fallbackDescriptions.get(page.label.split(' & ')[0]);
      const fallbackSentence =
        fallback == null
          ? undefined
          : `${fallback[0].toUpperCase()}${fallback.slice(1)}${fallback.endsWith('.') ? '' : '.'}`;
      // Pages without a page-named export (Stack) describe the pair of
      // components, which the README bullet does better than either JSDoc.
      const description =
        primary?.description ||
        (primary == null ? fallbackSentence : undefined) ||
        pageExports[0].description ||
        fallbackSentence ||
        '';
      if (description === '') {
        problems.push(
          `${sourceName}/${page.name}: no description — add a JSDoc summary to the primary component (or its props type)`,
        );
        continue;
      }
      generated.push({
        data: {
          name: page.name,
          sourceName,
          label: page.label,
          slug: componentSlug(page.name),
          category: categoryOf(sourceName) ?? '',
          description,
          exports: pageExports,
        },
        storyFiles: pageStoryFiles,
      });
    }

    if (isSplit) {
      for (const exported of exports) {
        if (!assignedExports.has(exported.name)) {
          problems.push(
            `${sourceName}: export "${exported.name}" is not assigned to a docs page`,
          );
        }
      }
      for (const storyFile of storyFiles) {
        if (!assignedStoryFiles.has(storyFile.file)) {
          problems.push(
            `${sourceName}: stories file "${storyFile.file}" is not assigned to a docs page`,
          );
        }
      }
    }
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
        demosModule(data.sourceName, withStories),
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
  rmSync(join(siteSrc, 'content/docs/getting-started.md'), {force: true});
  writeFileSync(
    join(siteSrc, 'content/docs/getting-started.mdx'),
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
