import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {Link, type LinkDisplay} from 'components/Link/Link';

// Real-layout tests for line wrapping. jsdom has no layout, so it cannot show
// where a link breaks across lines.

const TEXT = 'Business Associate Agreement';

function renderInWidth(width: number, display: LinkDisplay): void {
  render(
    <p style={{fontSize: 16, width}}>
      I agree to the{' '}
      <Link display={display} href="https://example.com" isExternalLink>
        {TEXT}
      </Link>{' '}
      and acknowledge it.
    </p>,
  );
}

function lineCount(element: HTMLElement): number {
  return element.getClientRects().length;
}

function lastWordTop(link: HTMLElement): number {
  const lastWord = TEXT.slice(TEXT.lastIndexOf(' ') + 1);
  const walker = document.createTreeWalker(link, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node != null; node = walker.nextNode()) {
    const text = node.textContent ?? '';
    if (text.endsWith(lastWord)) {
      const range = document.createRange();
      range.setStart(node, text.length - lastWord.length);
      range.setEnd(node, text.length);
      return range.getBoundingClientRect().top;
    }
  }
  throw new Error('Last word not found');
}

function iconTop(link: HTMLElement): number {
  // eslint-disable-next-line testing-library/no-node-access -- no testing-library query for an aria-hidden icon
  const icon = link.querySelector('[aria-hidden="true"]');
  if (icon == null) {
    throw new Error('External link icon not found');
  }
  return icon.getBoundingClientRect().top;
}

describe('Link display', () => {
  it('keeps a default link on one line', () => {
    renderInWidth(200, 'inline-flex');

    expect(lineCount(screen.getByRole('link'))).toBe(1);
  });

  it('wraps an inline link with the surrounding text', () => {
    renderInWidth(200, 'inline');

    expect(lineCount(screen.getByRole('link'))).toBeGreaterThan(1);
  });

  it('never leaves the external icon alone on a line', () => {
    // Sweep widths so some put the line break exactly where the icon would
    // no longer fit beside the last word.
    renderInWidth(120, 'inline');
    const link = screen.getByRole('link');
    const paragraph = screen.getByRole('paragraph');
    for (let width = 120; width <= 400; width += 2) {
      paragraph.style.width = `${width}px`;

      expect(
        Math.abs(iconTop(link) - lastWordTop(link)),
        `at ${width}px`,
      ).toBeLessThan(8);
    }
  });

  it.each([
    ['inline-flex', undefined, 'none'],
    ['inline', undefined, 'underline'],
    ['inline', false, 'none'],
  ] as const)(
    'with display %s and hasUnderline %s, underlines: %s',
    (display, hasUnderline, decoration) => {
      render(
        <Link display={display} hasUnderline={hasUnderline} href="/docs">
          Docs
        </Link>,
      );

      expect(
        getComputedStyle(screen.getByRole('link')).textDecorationLine,
      ).toBe(decoration);
    },
  );
});
