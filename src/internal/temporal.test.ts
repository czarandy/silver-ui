import {execFileSync, spawnSync} from 'node:child_process';

import {afterEach, expect, test} from 'vitest';

import {getTemporal, Temporal, TEMPORAL_DOCS_URL} from 'internal/temporal';

// The test setup installs the polyfill as the global; remember it so tests
// that remove it can put it back.
const installed = (globalThis as {Temporal?: unknown}).Temporal;

afterEach(() => {
  Object.assign(globalThis, {Temporal: installed});
});

test('forwards to the global Temporal', () => {
  expect(getTemporal()).toBe(installed);
  const date = Temporal.PlainDate.from('2024-02-29');
  expect(date.toString()).toBe('2024-02-29');
  expect(date).toBeInstanceOf(Temporal.PlainDate);
  expect(Temporal.PlainDate.compare(date, date)).toBe(0);
  expect('Now' in Temporal).toBe(true);
});

test('resolves the global on each access, not at import time', () => {
  const replacement = {PlainDate: {from: () => 'replaced'}};
  Object.assign(globalThis, {Temporal: replacement});
  expect(Temporal.PlainDate.from('2024-01-01')).toBe('replaced');
});

test('throws install instructions when Temporal is missing', () => {
  Reflect.deleteProperty(globalThis, 'Temporal');
  expect(() => Temporal.Now.instant()).toThrow(TEMPORAL_DOCS_URL);
  expect(() => getTemporal()).toThrow(/Install @js-temporal\/polyfill/);
});

// Apps install a Temporal polyfill in a module with a top-level await, which
// sibling imports don't wait for — so silver-ui must not touch Temporal at
// import time (README: "Temporal").
//
// Each entry is bundled with esbuild and imported in a fresh Node process with
// Temporal deleted. Re-importing the source through vitest instead pushes
// every library module through the shared transform pipeline, which took 20s+
// while the rest of the suite was running.
test.each(['src/index.ts', 'src/hooks/index.ts', 'src/relay/index.ts'])(
  'importing %s does not need Temporal',
  entry => {
    // The esbuild CLI rather than its JS API, which refuses to run under jsdom.
    const bundle = execFileSync(
      'node_modules/esbuild/bin/esbuild',
      [
        entry,
        '--bundle',
        '--format=esm',
        '--platform=node',
        '--packages=external',
        '--log-level=error',
        // Runs before any bundled module, so their top-level code sees no
        // Temporal.
        '--banner:js=delete globalThis.Temporal;',
      ],
      // The main entry bundles to several MB, past the 1 MB default.
      {encoding: 'utf8', maxBuffer: 64 * 1024 * 1024},
    );
    // Piped over stdin with the repo as cwd, so the external packages resolve
    // from its node_modules.
    const result = spawnSync('node', ['--input-type=module'], {
      input: bundle,
      encoding: 'utf8',
    });
    expect(result.stderr).toBe('');
    expect(result.status).toBe(0);
  },
);
