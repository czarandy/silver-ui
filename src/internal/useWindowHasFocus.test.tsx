import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useWindowHasFocus} from 'internal/useWindowHasFocus';

let pendingFrames: (FrameRequestCallback | null)[] = [];

function flushFrames(): void {
  const frames = pendingFrames;
  pendingFrames = [];
  act(() => {
    for (const frame of frames) {
      frame?.(0);
    }
  });
}

function FocusStatus(): React.JSX.Element {
  const hasFocus = useWindowHasFocus();
  return <div>{hasFocus ? 'focused' : 'unfocused'}</div>;
}

beforeEach(() => {
  pendingFrames = [];
  vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback =>
    pendingFrames.push(callback),
  );
  vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(handle => {
    pendingFrames[handle - 1] = null;
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useWindowHasFocus', () => {
  it('reads the initial document focus', () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false);

    render(<FocusStatus />);

    expect(screen.getByText('unfocused')).toBeInTheDocument();
  });

  it('reports blur immediately', () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    render(<FocusStatus />);

    fireEvent(window, new FocusEvent('blur'));

    expect(screen.getByText('unfocused')).toBeInTheDocument();
  });

  it('defers regained focus until the next animation frame', () => {
    vi.spyOn(document, 'hasFocus').mockReturnValue(false);
    render(<FocusStatus />);

    fireEvent(window, new FocusEvent('focus'));
    expect(screen.getByText('unfocused')).toBeInTheDocument();

    flushFrames();
    expect(screen.getByText('focused')).toBeInTheDocument();
  });
});
