import {existsSync, readdirSync} from 'node:fs';
import {join} from 'node:path';

export function getComponentEntries(root = process.cwd()) {
  return Object.fromEntries(
    readdirSync(join(root, 'src/components'), {withFileTypes: true})
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .filter(componentName =>
        existsSync(join(root, 'src/components', componentName, 'index.ts')),
      )
      .map(componentName => [
        `components/${componentName}/index`,
        `src/components/${componentName}/index.ts`,
      ]),
  );
}
