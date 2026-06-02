import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {Toast} from './Toast';
import {ToastViewport} from './ToastViewport';
import {useToast} from './useToast';

function AutoHideFixture(): React.JSX.Element {
  const toast = useToast();
  return <Button label="Show" onClick={() => toast({body: 'Auto hide'})} />;
}

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'showPopover', {
    configurable: true,
    value: vi.fn(),
  });
});

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

    expect(screen.getByTestId('toast')).toHaveClass(
      'silver-bg_status.info.solid',
      'silver-c_status.info.solidFg',
    );
    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'polite');

    rerender(
      <Toast
        autoHideDuration={5000}
        body="Success"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="success"
      />,
    );
    expect(screen.getByTestId('toast')).toHaveClass(
      'silver-bg_status.success.solid',
      'silver-c_status.success.solidFg',
    );
    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'status');
    expect(screen.getByTestId('toast')).toHaveAttribute('aria-live', 'polite');

    rerender(
      <Toast
        autoHideDuration={5000}
        body="Warning"
        data-testid="toast"
        isAutoHide={false}
        onDismiss={vi.fn()}
        type="warning"
      />,
    );
    expect(screen.getByTestId('toast')).toHaveClass(
      'silver-bg_status.warning.solid',
      'silver-c_status.warning.solidFg',
    );
    expect(screen.getByTestId('toast')).toHaveAttribute('role', 'alert');
    expect(screen.getByTestId('toast')).toHaveAttribute(
      'aria-live',
      'assertive',
    );

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
    expect(screen.getByTestId('toast')).toHaveClass(
      'silver-bg_status.error.solid',
      'silver-c_status.error.solidFg',
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

    function Fixture(): React.JSX.Element {
      const toast = useToast();
      return (
        <Button
          label="Show toast"
          onClick={() => toast({body: 'Saved successfully'})}
        />
      );
    }

    render(
      <ToastViewport>
        <Fixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'Show toast'}));
    expect(screen.getByText('Saved successfully')).toBeInTheDocument();
  });

  it('deduplicates by uniqueID using overwrite behavior', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
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

    render(
      <ToastViewport>
        <Fixture />
      </ToastViewport>,
    );

    await user.click(screen.getByRole('button', {name: 'First'}));
    await user.click(screen.getByRole('button', {name: 'Second'}));

    expect(screen.queryByText('First message')).not.toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('auto-dismisses info toasts by default', async () => {
    vi.useFakeTimers();

    render(
      <ToastViewport>
        <AutoHideFixture />
      </ToastViewport>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Show'}));
    expect(screen.getByText('Auto hide')).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(5200);
    expect(screen.queryByText('Auto hide')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
