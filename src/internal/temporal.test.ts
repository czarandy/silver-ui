import {afterEach, expect, test, vi} from 'vitest';

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
test.each([
  ['silver-ui', async () => import('silver-ui')],
  ['hooks', async () => import('hooks/index')],
  ['relay', async () => import('relay/index')],
])('importing %s does not need Temporal', async (_entry, load) => {
  Reflect.deleteProperty(globalThis, 'Temporal');
  vi.resetModules();
  await expect(load()).resolves.toBeDefined();
});
