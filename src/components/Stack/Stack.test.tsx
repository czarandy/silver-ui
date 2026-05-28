import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {HStack} from './HStack';
import {Stack} from './Stack';
import {VStack} from './VStack';

describe('Stack', () => {
  it('renders children', () => {
    render(
      <Stack>
        <div>One</div>
        <div>Two</div>
      </Stack>,
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
  });

  it('supports polymorphic element rendering', () => {
    render(
      <Stack data-testid="stack" element="nav">
        Content
      </Stack>,
    );

    expect(screen.getByTestId('stack').tagName).toBe('NAV');
  });

  it('maps HStack aliases to horizontal alignment', () => {
    render(
      <HStack align="center" data-testid="stack" justify="between">
        Content
      </HStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      alignItems: 'center',
      justifyContent: 'space-between',
    });
  });

  it('maps VStack aliases to vertical alignment', () => {
    render(
      <VStack align="end" data-testid="stack" justify="center">
        Content
      </VStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      alignItems: 'flex-end',
      justifyContent: 'center',
    });
  });

  it('applies className, style, data-testid, and ref to HStack root', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <HStack
        className="custom-stack"
        data-testid="stack"
        ref={ref}
        style={{color: 'red'}}>
        Content
      </HStack>,
    );

    const stack = screen.getByTestId('stack');
    expect(stack).toHaveClass('custom-stack');
    expect(stack).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
