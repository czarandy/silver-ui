import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CopyButton} from 'components/CopyButton/CopyButton';

function installClipboard(
  writeText: ReturnType<typeof vi.fn> = vi.fn().mockResolvedValue(undefined),
): ReturnType<typeof vi.fn> {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {writeText},
  });
  return writeText;
}

async function expectAnnouncement(
  role: 'alert' | 'status',
  message: string,
): Promise<void> {
  await waitFor(() => {
    expect(
      screen.getAllByRole(role).some(region => region.textContent === message),
    ).toBe(true);
  });
}

describe('CopyButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('copies a value and shows and announces the copied state', async () => {
    const user = userEvent.setup();
    const writeText = installClipboard();
    const onCopy = vi.fn();

    render(<CopyButton onCopy={onCopy} value="copy me" />);

    const copyButton = screen.getByRole('button', {name: 'Copy'});
    expect(copyButton).toHaveAttribute('aria-describedby');
    // eslint-disable-next-line testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(copyButton.querySelector('.lucide-copy')).toBeInTheDocument();
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Copy',
    );

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(onCopy).toHaveBeenCalledOnce();
    const copiedButton = screen.getByRole('button', {name: 'Copied'});
    // eslint-disable-next-line testing-library/no-node-access -- lucide icons are decorative SVGs
    expect(copiedButton.querySelector('.lucide-check')).toBeInTheDocument();
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Copied',
    );
    await expectAnnouncement('status', 'Copied');
  });

  it('resolves lazy values on each activation', async () => {
    const user = userEvent.setup();
    const writeText = installClipboard();
    const getValue = vi
      .fn<() => string>()
      .mockReturnValueOnce('first')
      .mockReturnValueOnce('second');

    render(<CopyButton value={getValue} />);

    await user.click(screen.getByRole('button', {name: 'Copy'}));
    await user.click(screen.getByRole('button', {name: 'Copied'}));

    expect(getValue).toHaveBeenCalledTimes(2);
    expect(writeText).toHaveBeenNthCalledWith(1, 'first');
    expect(writeText).toHaveBeenNthCalledWith(2, 'second');
  });

  it('supports custom labels and announcements', async () => {
    const user = userEvent.setup();
    installClipboard();

    render(
      <CopyButton
        copiedLabel="Token copied"
        copyLabel="Copy token"
        value="token"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Copy token'}));

    expect(
      screen.getByRole('button', {name: 'Token copied'}),
    ).toBeInTheDocument();
    await expectAnnouncement('status', 'Token copied');
  });

  it('reports rejected clipboard writes without entering copied state', async () => {
    const user = userEvent.setup();
    const error = new Error('Denied');
    installClipboard(vi.fn().mockRejectedValue(error));
    const onCopy = vi.fn();
    const onCopyError = vi.fn();

    render(
      <CopyButton
        errorMessage="Could not copy"
        onCopy={onCopy}
        onCopyError={onCopyError}
        value="copy me"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Copy'}));

    expect(onCopy).not.toHaveBeenCalled();
    expect(onCopyError).toHaveBeenCalledWith(error);
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
    await expectAnnouncement('alert', 'Could not copy');
  });

  it('reports an unavailable Clipboard API', async () => {
    const user = userEvent.setup();
    const onCopyError = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    render(<CopyButton onCopyError={onCopyError} value="copy me" />);

    await user.click(screen.getByRole('button', {name: 'Copy'}));

    expect(onCopyError).toHaveBeenCalledWith(expect.any(Error));
    await expectAnnouncement('alert', 'Copy failed');
  });

  it('reports errors thrown by a value getter', async () => {
    const user = userEvent.setup();
    const writeText = installClipboard();
    const error = new Error('Could not resolve value');
    const onCopyError = vi.fn();

    render(
      <CopyButton
        onCopyError={onCopyError}
        value={() => {
          throw error;
        }}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Copy'}));

    expect(writeText).not.toHaveBeenCalled();
    expect(onCopyError).toHaveBeenCalledWith(error);
    await expectAnnouncement('alert', 'Copy failed');
  });

  it('resets the copied state after the configured timeout', async () => {
    vi.useFakeTimers();
    installClipboard();

    render(<CopyButton resetTimeout={500} value="copy me" />);

    fireEvent.click(screen.getByRole('button', {name: 'Copy'}));
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('restarts the reset timeout after another successful copy', async () => {
    vi.useFakeTimers();
    installClipboard();

    render(<CopyButton resetTimeout={1000} value="copy me" />);

    fireEvent.click(screen.getByRole('button', {name: 'Copy'}));
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(750);
    });

    fireEvent.click(screen.getByRole('button', {name: 'Copied'}));
    await act(async () => {
      await Promise.resolve();
    });
    act(() => {
      vi.advanceTimersByTime(750);
    });
    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByRole('button', {name: 'Copy'})).toBeInTheDocument();
  });

  it('clears the reset timeout on unmount', async () => {
    vi.useFakeTimers();
    installClipboard();
    const clearTimeout = vi.spyOn(window, 'clearTimeout');
    const {unmount} = render(<CopyButton value="copy me" />);

    fireEvent.click(screen.getByRole('button', {name: 'Copy'}));
    await act(async () => {
      await Promise.resolve();
    });
    unmount();

    expect(clearTimeout).toHaveBeenCalled();
  });

  it('forwards presentation props and prevents copying when disabled', async () => {
    const user = userEvent.setup();
    const writeText = installClipboard();
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <CopyButton
        className="custom-copy-button"
        data-testid="copy-button"
        isDisabled
        ref={ref}
        size="sm"
        style={{marginTop: 12}}
        value="copy me"
        variant="primary"
      />,
    );

    const copyButton = screen.getByTestId('copy-button');
    expect(copyButton).toBeDisabled();
    expect(copyButton).toHaveAttribute('type', 'button');
    expect(copyButton).toHaveClass('custom-copy-button');
    expect(copyButton).toHaveStyle({marginTop: '12px'});
    expect(ref).toHaveBeenCalledWith(copyButton);

    await user.click(copyButton);
    expect(writeText).not.toHaveBeenCalled();
  });
});
