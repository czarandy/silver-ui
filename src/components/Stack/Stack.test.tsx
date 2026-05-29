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
      <Stack as="nav" data-testid="stack">
        Content
      </Stack>,
    );

    expect(screen.getByTestId('stack').tagName).toBe('NAV');
  });

  it('applies gap as inline style', () => {
    render(
      <VStack data-testid="stack" gap={4}>
        <div>One</div>
        <div>Two</div>
      </VStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({gap: '1rem'});
  });

  it('applies numeric width and height as pixels', () => {
    render(
      <VStack data-testid="stack" height={200} width={300}>
        Content
      </VStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      width: '300px',
      height: '200px',
    });
  });

  it('applies string width and height as-is', () => {
    render(
      <VStack data-testid="stack" height="100%" width="auto">
        Content
      </VStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      width: 'auto',
      height: '100%',
    });
  });

  it('applies wrap class', () => {
    render(
      <HStack data-testid="stack" wrap="wrap">
        Content
      </HStack>,
    );

    expect(screen.getByTestId('stack')).toHaveClass('silver-flex-wrap_wrap');
  });

  it('hAlign overrides justify on HStack', () => {
    render(
      <HStack data-testid="stack" hAlign="end" justify="center">
        Content
      </HStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      justifyContent: 'flex-end',
    });
  });

  it('vAlign overrides align on VStack', () => {
    render(
      <VStack align="center" data-testid="stack" vAlign="between">
        Content
      </VStack>,
    );

    expect(screen.getByTestId('stack')).toHaveStyle({
      justifyContent: 'space-between',
    });
  });

  it('applies className, style, data-testid, and ref to VStack root', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <VStack
        className="custom-vstack"
        data-testid="stack"
        ref={ref}
        style={{color: 'blue'}}>
        Content
      </VStack>,
    );

    const stack = screen.getByTestId('stack');
    expect(stack).toHaveClass('custom-vstack');
    expect(stack).toHaveStyle({color: 'rgb(0, 0, 255)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
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

  it('forwards ARIA attributes through HStack', () => {
    render(
      <HStack aria-label="Actions" data-testid="stack" role="toolbar">
        <button type="button">Cut</button>
        <button type="button">Copy</button>
      </HStack>,
    );

    const stack = screen.getByTestId('stack');
    expect(stack).toHaveAttribute('role', 'toolbar');
    expect(stack).toHaveAttribute('aria-label', 'Actions');
  });

  it('forwards ARIA attributes through VStack', () => {
    render(
      <VStack
        aria-labelledby="nav-heading"
        data-testid="stack"
        role="navigation">
        <a href="/home">Home</a>
        <a href="/about">About</a>
      </VStack>,
    );

    const stack = screen.getByTestId('stack');
    expect(stack).toHaveAttribute('role', 'navigation');
    expect(stack).toHaveAttribute('aria-labelledby', 'nav-heading');
  });
});
