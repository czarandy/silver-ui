import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useRef} from 'react';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {Toast} from 'components/Toast/Toast';
import {ToastViewport} from 'components/Toast/ToastViewport';
import type {ToastDismissFn} from 'components/Toast/types';
import {useToast} from 'components/Toast/useToast';

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: vi.fn(),
  });
});

function ShowToastFixture({
  body = 'Toast message',
  ...options
}: {body?: string} & Record<string, unknown>): React.JSX.Element {
  const toast = useToast();
  return <Button label="Show" onClick={() => toast({body, ...options})} />;
}

function OverwriteFixture(): React.JSX.Element {
  const toast = useToast();
  return (
    <>
      <Button
        label="First"
        onClick={() => toast({body: 'First message', uniqueID: 'save'})}
      />
      <Button
        label="Second"
        onClick={() => toast({body: 'Second message', uniqueID: 'save'})}
      />
    </>
  );
}

function IgnoreFixture(): React.JSX.Element {
  const toast = useToast();
  return (
    <>
      <Button
        label="Add first"
        onClick={() => toast({body: 'First toast', uniqueID: 'dup'})}
      />
      <Button
        label="Add second"
        onClick={() =>
          toast({
            body: 'Second toast',
            collisionBehavior: 'ignore',
            uniqueID: 'dup',
          })
        }
      />
    </>
  );
}

function DismissFnFixture(): React.JSX.Element {
  const toast = useToast();
  const dismissRef = useRef<ToastDismissFn | null>(null);
  return (
    <>
      <Button
        label="Show"
        onClick={() => {
          dismissRef.current = toast({body: 'Programmatic', isAutoHide: false});
        }}
      />
      <Button label="Dismiss" onClick={() => dismissRef.current?.()} />
    </>
  );
}

describe('Toast', () => {
  it('renders available toast types with matching status styles', () => {
    const {rerender} = render(
      <Toast
        autoHideDuration={5000}
        body="Info"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="info"
      />,
    );

    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'polite');

    rerender(
      <Toast
        autoHideDuration={5000}
        body="Error"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="error"
      />,
    );
    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('toast')).toHaveAttribute(
      'aria-live',
      'assertive',
    );
  });

  it('renders a dismissable toast', async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Saved"
        isAutoHide={false}
        onDismiss={onDismiss}
        type="info"
      />,
    );

    expect(screen.getByText('Saved')).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {name: 'Dismiss notification'}),
    );
    expect(onDismiss).toHaveBeenCalledWith('manual');
  });

  it('shows a toast from the hook', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <ShowToastFixture body="Saved successfully" />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('deduplicates by uniqueID using overwrite behavior', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <OverwriteFixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'First'}));
    await user.click(screen.getByRole('button', {name: 'Second'}));

    expect(screen.queryByText('First message')).not.toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('ignores duplicate uniqueID with collisionBehavior ignore', async () => {
    const user = userEvent.setup();

    render(
      <ToastViewport>
        <IgnoreFixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Add first'}));
    await user.click(screen.getByRole('button', {name: 'Add second'}));

    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.queryByText('Second toast')).not.toBeInTheDocument();
  });

  it('auto-dismisses info toasts by default', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport>
        <ShowToastFixture body="Auto hide" />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Auto hide')).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5200);
    });
    expect(screen.queryByText('Auto hide')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('does not auto-dismiss error toasts by default', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport>
        <ShowToastFixture body="Error toast" type="error" />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Error toast')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(10000);
    expect(screen.getByText('Error toast')).toBeInTheDocument();
    vi.useRealTimers();
  });

  it('pauses auto-dismiss on mouse hover', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Hover me"
        data-testid="toast"
        isAutoHide
        onDismiss={onDismiss}
        type="info"
      />,
    );

    await vi.advanceTimersByTimeAsync(2000);
    fireEvent.mouseEnter(screen.getByTestId('toast'));

    await vi.advanceTimersByTimeAsync(10000);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.mouseLeave(screen.getByTestId('toast'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(onDismiss).toHaveBeenCalledWith('auto');

    vi.useRealTimers();
  });

  it('pauses auto-dismiss on focus', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    render(
      <Toast
        autoHideDuration={5000}
        body="Focus me"
        data-testid="toast"
        isAutoHide
        onDismiss={onDismiss}
        type="info"
      />,
    );

    await vi.advanceTimersByTimeAsync(2000);
    fireEvent.focusIn(screen.getByTestId('toast'));

    await vi.advanceTimersByTimeAsync(10000);
    expect(onDismiss).not.toHaveBeenCalled();

    fireEvent.focusOut(screen.getByTestId('toast'));
    await vi.advanceTimersByTimeAsync(5000);
    expect(onDismiss).toHaveBeenCalledWith('auto');

    vi.useRealTimers();
  });

  it('calls onHide when toast is dismissed', async () => {
    const user = userEvent.setup();
    const onHide = vi.fn();

    render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="With callback" onHide={onHide} />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Show'}));
    await user.click(
      screen.getByRole('button', {name: 'Dismiss notification'}),
    );

    expect(onHide).toHaveBeenCalledWith('manual');
  });

  it('dismisses programmatically via returned function', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport isTopLayer={false}>
        <DismissFnFixture />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Programmatic')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Dismiss'}));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(screen.queryByText('Programmatic')).not.toBeInTheDocument();

    vi.useRealTimers();
  });

  it('clears pending exit timers when the viewport unmounts', () => {
    vi.useFakeTimers();

    const {unmount} = render(
      <ToastViewport isTopLayer={false}>
        <ShowToastFixture body="Unmounting" isAutoHide={false} />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    fireEvent.click(screen.getByRole('button', {name: 'Dismiss notification'}));
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
    vi.useRealTimers();
  });

  it('limits visible toasts to maxVisible', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const toast = useToast();
      let counter = 0;
      return (
        <Button
          label="Add"
          onClick={() => toast({body: `Toast ${++counter}`, isAutoHide: false})}
        />
      );
    }

    render(
      <ToastViewport isTopLayer={false} maxVisible={2}>
        <Fixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Add'}));
    await user.click(screen.getByRole('button', {name: 'Add'}));
    await user.click(screen.getByRole('button', {name: 'Add'}));

    const dismissButtons = screen.getAllByRole('button', {
      name: 'Dismiss notification',
    });
    expect(dismissButtons).toHaveLength(2);
  });

  it('applies inset styles to the viewport', () => {
    render(
      <ToastViewport
        data-testid="viewport"
        inset={{top: 64, end: 16}}
        isTopLayer={false}
      />,
    );

    const viewport = screen.getByTestId('viewport');
    expect(viewport).toHaveStyle({top: '64px', insetInlineEnd: '16px'});
  });
});
