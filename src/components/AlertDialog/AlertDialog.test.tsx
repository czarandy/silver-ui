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
});
