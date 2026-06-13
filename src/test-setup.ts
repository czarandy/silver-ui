import '@testing-library/jest-dom/vitest';

import {vi} from 'vitest';

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
