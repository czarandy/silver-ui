import '@testing-library/jest-dom/vitest';

import {vi} from 'vitest';

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
