import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {VisuallyHidden} from 'components/VisuallyHidden';

describe('VisuallyHidden', () => {
  it('keeps children available to assistive technology while visually hiding them', () => {
    render(<VisuallyHidden>Screen reader text</VisuallyHidden>);
    const element = screen.getByText('Screen reader text');

    expect(element).toBeInTheDocument();
    expect(element).toHaveClass('silver-cp-path_inset(50%)');
  });

  it('forwards ref to the underlying span', () => {
    const ref = vi.fn<(element: HTMLSpanElement | null) => void>();

    render(<VisuallyHidden ref={ref}>Hidden text</VisuallyHidden>);

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });

  it('merges a custom className with the visually-hidden styles', () => {
    render(
      <VisuallyHidden className="custom-class">Hidden text</VisuallyHidden>,
    );
    const element = screen.getByText('Hidden text');

    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass('silver-cp-path_inset(50%)');
  });

  it('forwards data-testid, style, and arbitrary span props to the root', () => {
    render(
      <VisuallyHidden
        data-testid="sr-only"
        id="hint"
        lang="en"
        style={{color: 'red'}}>
        Hidden text
      </VisuallyHidden>,
    );
    const element = screen.getByTestId('sr-only');

    expect(element.tagName).toBe('SPAN');
    expect(element).toHaveAttribute('id', 'hint');
    expect(element).toHaveAttribute('lang', 'en');
    expect(element).toHaveStyle({color: 'rgb(255, 0, 0)'});
  });
});
