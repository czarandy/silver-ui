import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {Kbd} from './Kbd';

describe('Kbd', () => {
  const originalPlatform = navigator.platform;

  afterEach(() => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: originalPlatform,
    });
  });

  it('renders a single key', () => {
    render(<Kbd keys="k" />);

    expect(screen.getByText('K').tagName).toBe('KBD');
  });

  it('renders multiple keys separated by plus signs', () => {
    render(<Kbd keys="mod+k" />);

    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('renders mod as command on Mac platforms', () => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'MacIntel',
    });

    render(<Kbd keys="mod" />);

    expect(screen.getByText('⌘')).toBeInTheDocument();
  });

  it('maps modifier and special keys to symbols', () => {
    render(<Kbd keys="ctrl+alt+shift+enter+escape" />);

    expect(screen.getByText('⌃')).toBeInTheDocument();
    expect(screen.getByText('⌥')).toBeInTheDocument();
    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('↵')).toBeInTheDocument();
    expect(screen.getByText('Esc')).toBeInTheDocument();
  });

  it('handles whitespace around keys', () => {
    render(<Kbd keys="mod + k" />);

    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLSpanElement | null) => void>();

    render(
      <Kbd
        className="custom-kbd"
        data-testid="kbd"
        keys="k"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const root = screen.getByTestId('kbd');
    expect(root).toHaveClass('custom-kbd');
    expect(root).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLSpanElement));
  });
});
