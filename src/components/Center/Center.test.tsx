import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Center} from './Center';

describe('Center', () => {
  it('renders children centered on both axes by default', () => {
    render(<Center data-testid="center">Content</Center>);

    expect(screen.getByTestId('center')).toHaveTextContent('Content');
  });

  it('renders inline when requested', () => {
    render(
      <Center data-testid="center" isInline>
        Content
      </Center>,
    );

    expect(screen.getByTestId('center')).toHaveClass('silver-d_inline-flex');
  });

  it('applies sizing and root props', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Center
        className="custom-center"
        data-testid="center"
        height={200}
        ref={ref}
        style={{color: 'red'}}
        width={300}>
        Content
      </Center>,
    );

    const center = screen.getByTestId('center');
    expect(center).toHaveClass('custom-center');
    expect(center).toHaveStyle({
      color: 'rgb(255, 0, 0)',
      height: '200px',
      width: '300px',
    });
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
