import {render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {Kbd} from 'components/Kbd/Kbd';

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

  it('sets aria-label with readable key names for a single key', () => {
    render(<Kbd keys="enter" />);

    expect(screen.getByLabelText('Enter')).toBeInTheDocument();
  });

  it('sets aria-label with readable key names for a multi-key shortcut', () => {
    render(<Kbd keys="ctrl+shift+k" />);

    expect(screen.getByLabelText('Control+Shift+K')).toBeInTheDocument();
  });

  it('sets aria-label with Command for mod on Mac', () => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'MacIntel',
    });

    render(<Kbd keys="mod+k" />);

    expect(screen.getByLabelText('Command+K')).toBeInTheDocument();
  });

  it('sets aria-label with Control for mod on non-Mac', () => {
    render(<Kbd keys="mod+k" />);

    expect(screen.getByLabelText('Control+K')).toBeInTheDocument();
  });

  it('renders the plus key via the "plus" keyword', () => {
    render(<Kbd keys="shift+plus" />);

    expect(screen.getByText('⇧')).toBeInTheDocument();
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByLabelText('Shift+Plus')).toBeInTheDocument();
  });

  it('throws in development when keys resolve to empty', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Kbd keys="" />);
    }).toThrow('`keys` prop resolved to zero keys');

    errorSpy.mockRestore();
  });

  it('renders arrow key symbols', () => {
    render(<Kbd keys="up+down+left+right" />);

    expect(screen.getByText('↑')).toBeInTheDocument();
    expect(screen.getByText('↓')).toBeInTheDocument();
    expect(screen.getByText('←')).toBeInTheDocument();
    expect(screen.getByText('→')).toBeInTheDocument();
  });

  it('renders backspace and tab symbols', () => {
    render(<Kbd keys="backspace+tab" />);

    expect(screen.getByText('⌫')).toBeInTheDocument();
    expect(screen.getByText('⇥')).toBeInTheDocument();
  });

  it('uppercases unknown keys', () => {
    render(<Kbd keys="f1+space+delete" />);

    expect(screen.getByText('F1')).toBeInTheDocument();
    expect(screen.getByText('SPACE')).toBeInTheDocument();
    expect(screen.getByText('DELETE')).toBeInTheDocument();
  });

  it('throws when malformed keys strings resolve to empty', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<Kbd keys="+" />);
    }).toThrow('`keys` prop resolved to zero keys');

    errorSpy.mockRestore();
  });

  it('handles trailing separators when at least one key is present', () => {
    render(<Kbd keys="mod+" />);
    expect(screen.getByText('Ctrl')).toBeInTheDocument();
  });

  it('renders duplicate keys with unique React keys', () => {
    render(<Kbd keys="up+up" />);

    const arrows = screen.getAllByText('↑');
    expect(arrows).toHaveLength(2);
  });

  it('renders mod as Ctrl on explicitly non-Mac platforms', () => {
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'Win32',
    });

    render(<Kbd keys="mod" />);

    expect(screen.getByText('Ctrl')).toBeInTheDocument();
    expect(screen.getByLabelText('Control')).toBeInTheDocument();
  });

  it('forwards className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

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
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});
