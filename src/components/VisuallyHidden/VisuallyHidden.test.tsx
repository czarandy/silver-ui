import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {css} from 'styled-system/css';

describe('VisuallyHidden', () => {
  it('keeps children available to assistive technology while visually hiding them', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    const element = screen.getByText('Screen reader text');

    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveClass('silver-cp-path_inset(50%)');
  });

  it('applies the hardened clip recipe: legacy clip fallback, top-left pinning, and pointer/selection guards', () => {
    render(<VisuallyHidden>Hidden text</VisuallyHidden>);
    const classes = screen.getByText('Hidden text').className.split(' ');

    // Derive each expected atomic class from the same generator the component
    // uses, so the assertions don't hard-code Panda's hashing scheme.
    for (const expected of [
      css({clip: 'rect(0 0 0 0)'}),
      css({clipPath: 'inset(50%)'}),
      css({insetBlockStart: 0}),
      css({insetInlineStart: 0}),
      css({pointerEvents: 'none'}),
      css({userSelect: 'none'}),
    ]) {
      expect(classes).toContain(expected);
    }
  });

  it('renders as the element given by the `as` prop for block / live-region use', () => {
    render(
      <VisuallyHidden aria-live="polite" as="div" role="status">
        Added tag
      </VisuallyHidden>,
    );
    const element = screen.getByRole('status');

    expect(element.tagName).toBe('DIV');
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveTextContent('Added tag');
  });

  it('forwards ref to the root element', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(<VisuallyHidden ref={ref}>Hidden text</VisuallyHidden>);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('passes accessibility and data props through to the root', () => {
    render(
      <VisuallyHidden data-testid="sr-only" id="hint" lang="en">
        Hidden text
      </VisuallyHidden>,
    );
    const element = screen.getByTestId('sr-only');

    expect(element).toHaveAttribute('id', 'hint');
    expect(element).toHaveAttribute('lang', 'en');
  });
});
