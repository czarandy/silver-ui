import {act, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import useClipboard, {
  type ClipboardValue,
  type UseClipboardOptions,
} from 'hooks/useClipboard';

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

function installClipboard(
  writeText: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
): ReturnType<typeof vi.fn> {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {writeText},
  });
  return writeText;
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
  vi.useRealTimers();
});

function ClipboardHarness({
  onResult,
  options,
  value = 'copy me',
}: {
  onResult?: (result: boolean) => void;
  options?: UseClipboardOptions;
  value?: ClipboardValue;
}): React.JSX.Element {
  const {announcer, copy, isCopied} = useClipboard(options);

  return (
    <div>
      <button
        onClick={() => {
          void copy(value).then(onResult);
        }}
        type="button">
        {isCopied ? 'Copied state' : 'Copy'}
      </button>
      {announcer}
    </div>
  );
}

async function clickCopy(buttonName = 'Copy'): Promise<void> {
  fireEvent.click(screen.getByRole('button', {name: buttonName}));
  await act(async () => {
    await Promise.resolve();
  });
}

describe('useClipboard', () => {
  it('copies a value, enters copied state, and announces success', async () => {
    const writeText = installClipboard();
    const onCopy = vi.fn();
    const onResult = vi.fn();
    render(
      <ClipboardHarness
        onResult={onResult}
        options={{onCopy}}
        value="share this"
      />,
    );

    await clickCopy();
    flushFrames();

    expect(writeText).toHaveBeenCalledWith('share this');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(onResult).toHaveBeenCalledWith(true);
    expect(
      screen.getByRole('button', {name: 'Copied state'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });

  it('handles clipboard failures and announces them assertively', async () => {
    const error = new Error('Permission denied');
    installClipboard(vi.fn().mockRejectedValue(error));
    const onCopyError = vi.fn();
    const onResult = vi.fn();
    render(
      <ClipboardHarness
        onResult={onResult}
        options={{errorMessage: 'Could not copy', onCopyError}}
      />,
    );

    await clickCopy();
    flushFrames();

    expect(onCopyError).toHaveBeenCalledWith(error);
    expect(onResult).toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Could not copy');
  });

  it('resets copied state after the configured duration', async () => {
    vi.useFakeTimers({toFake: ['clearTimeout', 'setTimeout']});
    installClipboard();
    render(<ClipboardHarness options={{resetTimeout: 500}} />);

    await clickCopy();
    expect(
      screen.getByRole('button', {name: 'Copied state'}),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('blanks the live region before re-announcing a repeated copy', async () => {
    installClipboard();
    render(<ClipboardHarness />);

    await clickCopy();
    flushFrames();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');

    await clickCopy('Copied state');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();

    flushFrames();
    expect(screen.getByRole('status')).toHaveTextContent('Copied');
  });
});
