import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {AlertDialog} from 'components/AlertDialog/AlertDialog';
import {useAlertDialog} from 'components/AlertDialog/useAlertDialog';
import {Button} from 'components/Button';

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

  it('forwards className and style to the dialog', () => {
    render(
      <AlertDialog
        actionLabel="Delete"
        className="custom-class"
        description="This cannot be undone."
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        style={{margin: 10}}
        title="Delete item?"
      />,
    );

    const dialog = screen.getByRole('alertdialog', {name: 'Delete item?'});
    expect(dialog).toHaveClass('custom-class');
    expect(dialog).toHaveStyle({margin: '10px'});
  });

  it('clears stale options when hide is called', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const alert = useAlertDialog();
      return (
        <>
          <Button
            label="Open"
            onClick={() =>
              alert.show({
                actionLabel: 'Delete',
                description: 'This cannot be undone.',
                onAction: alert.hide,
                title: 'Delete item?',
              })
            }
          />
          <span data-testid="is-open">{String(alert.isOpen)}</span>
          {alert.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(
      screen.getByRole('alertdialog', {name: 'Delete item?'}),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(screen.getByTestId('is-open')).toHaveTextContent('false');
    expect(
      screen.queryByRole('alertdialog', {name: 'Delete item?'}),
    ).not.toBeInTheDocument();
  });

  it('labels the dialog via aria-labelledby pointing to the heading', () => {
    render(
      <AlertDialog
        actionLabel="Delete"
        description="This cannot be undone."
        isOpen
        onAction={() => {}}
        onOpenChange={() => {}}
        title="Delete item?"
      />,
    );

    const dialog = screen.getByRole('alertdialog', {name: 'Delete item?'});
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(dialog).toHaveAttribute('aria-labelledby');

    const labelledById = dialog.getAttribute('aria-labelledby') ?? '';
    // eslint-disable-next-line testing-library/no-node-access -- resolving the aria-labelledby id reference
    const heading = document.getElementById(labelledById);
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Delete item?');
  });

  it('guards against rapid double-invocation of onAction', async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <AlertDialog
        actionLabel="Delete"
        description="This cannot be undone."
        isOpen
        onAction={onAction}
        onOpenChange={() => {}}
        title="Delete item?"
      />,
    );

    const actionButton = screen.getByRole('button', {name: 'Delete'});
    await user.click(actionButton);
    await user.click(actionButton);
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('resets the action guard when the dialog is reopened', async () => {
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
                actionLabel: 'Delete',
                description: 'This cannot be undone.',
                onAction: () => {
                  onAction();
                  alert.hide();
                },
                title: 'Delete item?',
              })
            }
          />
          {alert.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onAction).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', {name: 'Open'}));
    await user.click(screen.getByRole('button', {name: 'Delete'}));
    expect(onAction).toHaveBeenCalledTimes(2);
  });
});
