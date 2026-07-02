import {execFileSync} from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {tmpdir} from 'node:os';
import process from 'node:process';
import {gunzipSync} from 'node:zlib';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const tempDir = await mkdtemp(join(tmpdir(), 'silver-ui-package-smoke-'));

try {
  execFileSync(
    'npm',
    [
      'pack',
      rootDir,
      '--ignore-scripts',
      '--pack-destination',
      tempDir,
    ],
    {
      env: {
        ...process.env,
        NPM_CONFIG_CACHE: join(tempDir, '.npm-cache'),
        npm_config_cache: join(tempDir, '.npm-cache'),
      },
      stdio: ['ignore', 'ignore', 'ignore'],
    },
  );
  const tarballs = (await readdir(tempDir)).filter(file => file.endsWith('.tgz'));
  if (tarballs.length !== 1) {
    throw new Error(
      `Expected npm pack to create one tarball, found ${tarballs.length}.`,
    );
  }

  const tarballPath = join(tempDir, tarballs[0]);
  const nodeModulesDir = join(tempDir, 'consumer', 'node_modules');
  const packageDir = join(nodeModulesDir, 'silver-ui');

  await mkdir(packageDir, {recursive: true});
  await extractPackageTarball(tarballPath, packageDir);

  await verifyUseClientPreserved(packageDir);

  for (const packageName of [
    '@js-temporal/polyfill',
    '@types/react',
    '@types/react-dom',
    'lucide-react',
    'react',
    'react-dom',
  ]) {
    await linkPackage(packageName, nodeModulesDir);
  }

  const consumerDir = join(tempDir, 'consumer');
  await writeFile(
    join(consumerDir, 'package.json'),
    JSON.stringify(
      {
        name: 'silver-ui-package-smoke-consumer',
        private: true,
        type: 'module',
      },
      null,
      2,
    ) + '\n',
  );
  await writeFile(
    join(consumerDir, 'index.ts'),
    `
import {cx, type ButtonProps as RootButtonProps} from 'silver-ui';
import {Alert, type AlertProps} from 'silver-ui/Alert';
import {Button, type ButtonProps} from 'silver-ui/Button';
import {Layout, type LayoutProps, type SpacingToken} from 'silver-ui/Layout';
import {Popover, type PopoverProps} from 'silver-ui/Popover';
import {Spinner, type SpinnerProps} from 'silver-ui/Spinner';

export const components = [Alert, Button, Layout, Popover, Spinner] as const;
export const className = cx('base', 'extra');
export type PublicProps =
  | AlertProps
  | ButtonProps
  | LayoutProps
  | PopoverProps
  | RootButtonProps
  | SpinnerProps;
export type PublicToken = SpacingToken;
`.trimStart(),
  );
  await writeFile(
    join(consumerDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          allowSyntheticDefaultImports: true,
          jsx: 'react-jsx',
          lib: ['DOM', 'DOM.Iterable', 'ES2022'],
          module: 'ESNext',
          moduleResolution: 'bundler',
          noEmit: true,
          skipLibCheck: false,
          strict: true,
          target: 'ES2022',
        },
        include: ['index.ts'],
      },
      null,
      2,
    ) + '\n',
  );

  execFileSync(
    join(rootDir, 'node_modules', '.bin', 'tsc'),
    ['-p', join(consumerDir, 'tsconfig.json')],
    {stdio: 'inherit'},
  );
} finally {
  await rm(tempDir, {force: true, recursive: true});
}

// The source already ships at least one `use client` directive (CodeBlock).
// esbuild's code splitting drops top-level directives unless the
// preserve-directives plugin re-hoists them onto the emitted chunks, so this
// asserts the build preserves the directive somewhere in the shipped output.
async function verifyUseClientPreserved(packageDir) {
  const distDir = join(packageDir, 'dist');
  const files = await readdir(distDir, {recursive: true, withFileTypes: true});

  for (const file of files) {
    if (!file.isFile() || !/\.(js|cjs)$/.test(file.name)) {
      continue;
    }
    const source = await readFile(join(file.parentPath, file.name), 'utf8');
    const firstStatement = source.trimStart();
    if (
      firstStatement.startsWith(`'use client'`) ||
      firstStatement.startsWith(`"use client"`)
    ) {
      return;
    }
  }

  throw new Error(
    `No 'use client' directive found anywhere in the shipped dist output. ` +
      `The tsup preserve-directives plugin is not preserving directives ` +
      `through code splitting.`,
  );
}

async function linkPackage(packageName, nodeModulesDir) {
  const source = join(rootDir, 'node_modules', packageName);
  if (!existsSync(source)) {
    throw new Error(`Package smoke test dependency is not installed: ${packageName}`);
  }

  const destination = join(nodeModulesDir, packageName);
  await mkdir(dirname(destination), {recursive: true});
  await symlink(source, destination, 'dir');
}

async function extractPackageTarball(tarballPath, destination) {
  const archive = gunzipSync(await readFile(tarballPath));
  let offset = 0;

  while (offset + 512 <= archive.length) {
    const header = archive.subarray(offset, offset + 512);
    offset += 512;

    if (header.every(byte => byte === 0)) {
      break;
    }

    const size = parseOctal(header, 124, 12);
    const type = String.fromCharCode(header[156]);
    const name = getTarString(header, 0, 100);
    const prefix = getTarString(header, 345, 155);
    const fullName = prefix === '' ? name : `${prefix}/${name}`;
    const relativePath = fullName.startsWith('package/')
      ? fullName.slice('package/'.length)
      : fullName;
    const fileData = archive.subarray(offset, offset + size);
    offset += Math.ceil(size / 512) * 512;

    if (relativePath === '' || type === 'x' || type === 'g') {
      continue;
    }

    const target = join(destination, relativePath);
    if (type === '5') {
      await mkdir(target, {recursive: true});
      continue;
    }

    if (type === '0' || type === '\0' || type === '') {
      await mkdir(dirname(target), {recursive: true});
      await writeFile(target, fileData);
    }
  }
}

function parseOctal(buffer, start, length) {
  const value = getTarString(buffer, start, length).trim();
  return value === '' ? 0 : Number.parseInt(value, 8);
}

function getTarString(buffer, start, length) {
  const end = start + length;
  let actualEnd = start;

  while (actualEnd < end && buffer[actualEnd] !== 0) {
    actualEnd += 1;
  }

  return buffer.toString('utf8', start, actualEnd);
}
