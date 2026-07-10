import '@testing-library/jest-dom/vitest';

import {afterEach, vi} from 'vitest';
import {resetLayerStack} from 'internal/layerStack';

// jsdom does not implement real navigation, so clicking real anchors/submit
// buttons makes it emit a benign "Not implemented: navigation" error. jsdom
// writes it straight to stderr (bypassing the test console), so filter just
// that line here to keep it out of the test output.
type StderrWrite = (chunk: string | Uint8Array, ...rest: unknown[]) => boolean;
const nodeStderr = (
  globalThis as unknown as {process: {stderr: {write: StderrWrite}}}
).process.stderr;
const originalStderrWrite = nodeStderr.write.bind(nodeStderr);
nodeStderr.write = (chunk, ...rest) => {
  if (
    typeof chunk === 'string' &&
    chunk.includes('Not implemented: navigation')
  ) {
    return true;
  }
  return originalStderrWrite(chunk, ...rest);
};

if (!Reflect.has(HTMLElement.prototype, 'showPopover')) {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });
}

if (!Reflect.has(HTMLElement.prototype, 'hidePopover')) {
  Object.defineProperty(HTMLElement.prototype, 'hidePopover', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });
}

// jsdom does not implement scrollIntoView, but keyboard-navigable listboxes
// call it to keep the highlighted option visible. Provide a no-op stub so those
// components can be exercised (and the call spied on) in tests.
if (!Reflect.has(HTMLElement.prototype, 'scrollIntoView')) {
  Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    configurable: true,
    value: vi.fn(),
    writable: true,
  });
}

afterEach(() => {
  resetLayerStack();
});
