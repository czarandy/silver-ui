import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {VisuallyHidden} from 'internal/VisuallyHidden';

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
});
