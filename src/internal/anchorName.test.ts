import {describe, expect, it} from 'vitest';
import {addAnchorName, removeAnchorName} from 'internal/anchorName';

function getAnchorName(element: HTMLElement): string {
  return (element.style as unknown as Record<string, string>).anchorName;
}

describe('anchorName', () => {
  it('composes anchors and removes only the requested anchor', () => {
    const element = document.createElement('div');

    addAnchorName(element, '--first');
    addAnchorName(element, '--second');
    addAnchorName(element, '--first');
    expect(getAnchorName(element)).toBe('--first, --second');

    removeAnchorName(element, '--first');
    expect(getAnchorName(element)).toBe('--second');

    removeAnchorName(element, '--missing');
    expect(getAnchorName(element)).toBe('--second');
  });
});
