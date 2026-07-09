import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import useAnnounce, {type AnnouncePoliteness} from 'hooks/useAnnounce';

// `useAnnounce` defers writing each message by one animation frame. Drive the
// frame queue by hand so every assertion below lands on an exact state rather
// than racing jsdom's timer.
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

function Announcer({
  message = 'Removed Apple',
  politeness,
}: {
  message?: string;
  politeness?: AnnouncePoliteness;
}): React.JSX.Element {
  const {announce, announcer, clear} = useAnnounce();

  return (
    <div>
      <button onClick={() => announce(message, politeness)} type="button">
        Announce
      </button>
      <button onClick={clear} type="button">
        Clear
      </button>
      {announcer}
    </div>
  );
}

function clickAnnounce(): void {
  fireEvent.click(screen.getByRole('button', {name: 'Announce'}));
}

describe('useAnnounce', () => {
  it('renders empty polite and assertive live regions up front', () => {
    render(<Announcer />);

    const polite = screen.getByRole('status');
    expect(polite).toHaveAttribute('aria-live', 'polite');
    expect(polite).toHaveAttribute('aria-atomic', 'true');
    expect(polite).toBeEmptyDOMElement();

    const assertive = screen.getByRole('alert');
    expect(assertive).toHaveAttribute('aria-live', 'assertive');
    expect(assertive).toHaveAttribute('aria-atomic', 'true');
    expect(assertive).toBeEmptyDOMElement();
  });

  it('announces politely by default', () => {
    render(<Announcer />);

    clickAnnounce();
    flushFrames();

    expect(screen.getByRole('status')).toHaveTextContent('Removed Apple');
    expect(screen.getByRole('alert')).toBeEmptyDOMElement();
  });

  it('announces assertively into the alert region', () => {
    render(<Announcer message="Upload failed" politeness="assertive" />);

    clickAnnounce();
    flushFrames();

    expect(screen.getByRole('alert')).toHaveTextContent('Upload failed');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('blanks the region before re-announcing an identical message', () => {
    render(<Announcer />);

    clickAnnounce();
    flushFrames();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Apple');

    // A screen reader only announces a live region when its text changes, so
    // repeating a message must pass through an empty state first.
    clickAnnounce();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    flushFrames();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Apple');
  });

  it('keeps only the last message when announcing twice within one frame', () => {
    function DoubleAnnouncer(): React.JSX.Element {
      const {announce, announcer} = useAnnounce();
      return (
        <div>
          <button
            onClick={() => {
              announce('First');
              announce('Second');
            }}
            type="button">
            Announce
          </button>
          {announcer}
        </div>
      );
    }
    render(<DoubleAnnouncer />);

    clickAnnounce();
    flushFrames();

    expect(screen.getByRole('status')).toHaveTextContent('Second');
  });

  it('empties the regions on clear', () => {
    render(<Announcer />);

    clickAnnounce();
    flushFrames();
    expect(screen.getByRole('status')).toHaveTextContent('Removed Apple');

    fireEvent.click(screen.getByRole('button', {name: 'Clear'}));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('cancels a pending announcement on unmount', () => {
    const {unmount} = render(<Announcer />);

    clickAnnounce();
    expect(pendingFrames).toHaveLength(1);

    unmount();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalledTimes(1);
    // Running the frame queue must not attempt to set state on the unmounted
    // component.
    expect(() => flushFrames()).not.toThrow();
  });
});
