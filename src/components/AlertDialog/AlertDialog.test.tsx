import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {AlertDialog} from './AlertDialog';
import {useAlertDialog} from './useAlertDialog';

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

describe('AlertDialog', () => {
  it('renders an alertdialog with actions', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <AlertDialog
        actionLabel="Delete"
        description="This cannot be undone."
        isOpen
        onAction={onAction}
        onOpenChange={onOpenChange}
        title="Delete item?"
      />,
    );

    expect(
      screen.getByRole('alertdialog', {name: 'Delete item?'}),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onAction).toHaveBeenCalled();
    await user.click(screen.getByRole('button', {name: 'Cancel'}));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('supports the imperative hook', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    function Fixture(): React.JSX.Element {
      const alert = useAlertDialog();
      return (
        <>
          <Button
            label="Open"
            onClick={() =>
              alert.show({
                actionLabel: 'Confirm',
                description: 'Proceed?',
                onAction,
                title: 'Confirm action',
              })
            }
          />
          {alert.element}
        </>
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(
      screen.getByRole('alertdialog', {name: 'Confirm action'}),
    ).toBeInTheDocument();
  });

  it('disables the action button when isActionLoading is true', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <AlertDialog
        actionLabel="Delete"
        description="This cannot be undone."
        isActionLoading
        isOpen
        onAction={onAction}
        onOpenChange={() => {}}
        title="Delete item?"
      />,
    );

    const actionButton = screen.getByRole('button', {name: 'Delete'});
    expect(actionButton).toHaveAttribute('aria-busy', 'true');
    await user.click(actionButton);
    expect(onAction).not.toHaveBeenCalled();
  });

  it('renders a custom cancelLabel', () => {
    render(
      <AlertDialog
        actionLabel="Delete"
        cancelLabel="No, keep it"
        description="This cannot be undone."
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        title="Delete item?"
      />,
    );

    expect(
      screen.getByRole('button', {name: 'No, keep it'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Cancel'}),
    ).not.toBeInTheDocument();
  });

  it('renders with a custom actionVariant', () => {
    render(
      <AlertDialog
        actionLabel="Archive"
        actionVariant="primary"
        description="Archive this project?"
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        title="Archive?"
      />,
    );

    expect(screen.getByRole('button', {name: 'Archive'})).toBeInTheDocument();
  });

  it('forwards data-testid to the dialog', () => {
    render(
      <AlertDialog
        actionLabel="Delete"
        data-testid="confirm-dialog"
        description="This cannot be undone."
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        title="Delete item?"
      />,
    );

    expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument();
  });

  it('closes the dialog via the imperative hide method', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const alert = useAlertDialog();
      return (
        <>
          <Button
            label="Open"
            onClick={() =>
              alert.show({
                actionLabel: 'Confirm',
                description: 'Proceed?',
                onAction: alert.hide,
                title: 'Confirm action',
              })
            }
          />
          {alert.element}
        </>
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(
      screen.getByRole('alertdialog', {name: 'Confirm action'}),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Confirm'}));
    expect(
      screen.queryByRole('alertdialog', {name: 'Confirm action'}),
    ).not.toBeInTheDocument();
  });

  it('updates content when show() is called again with different options', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const alert = useAlertDialog();
      return (
        <>
          <Button
            label="First"
            onClick={() =>
              alert.show({
                actionLabel: 'Delete',
                description: 'Delete this?',
                onAction: alert.hide,
                title: 'Delete item',
              })
            }
          />
          <Button
            label="Second"
            onClick={() =>
              alert.show({
                actionLabel: 'Archive',
                description: 'Archive this?',
                onAction: alert.hide,
                title: 'Archive item',
              })
            }
          />
          {alert.element}
        </>
      );
    }

    render(<Fixture />);
    await user.click(screen.getByRole('button', {name: 'First'}));
    expect(
      screen.getByRole('alertdialog', {name: 'Delete item'}),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Second'}));
    expect(
      screen.getByRole('alertdialog', {name: 'Archive item'}),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('alertdialog', {name: 'Delete item'}),
    ).not.toBeInTheDocument();
  });
});
