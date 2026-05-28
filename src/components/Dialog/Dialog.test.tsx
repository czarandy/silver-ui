import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {Dialog} from './Dialog';
import {useDialog} from './useDialog';

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

describe('Dialog', () => {
  it('opens and renders dialog content', () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        Dialog content
      </Dialog>,
    );

    expect(screen.getByRole('dialog', {name: 'Preferences'})).toHaveAttribute(
      'open',
    );
    expect(screen.getByText('Dialog content')).toBeInTheDocument();
  });

  it('closes the native dialog when isOpen is false', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen={false}
        label="Preferences"
        onOpenChange={() => {}}>
        Hidden content
      </Dialog>,
    );

    expect(screen.getByTestId('dialog')).not.toHaveAttribute('open');
  });

  it('calls onOpenChange(false) on backdrop click for info dialogs', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}
        purpose="info">
        Content
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click for form dialogs', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}
        purpose="form">
        Content
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('uses alertdialog role and blocks escape for required dialogs', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}
        purpose="required">
        Content
      </Dialog>,
    );

    const dialog = screen.getByRole('alertdialog');
    const cancelEvent = new Event('cancel', {cancelable: true});
    dialog.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) on cancel when escape is allowed', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}
        purpose="form">
        Content
      </Dialog>,
    );

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen.getByRole('dialog').dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('applies className, style, ref, and data-testid to the dialog', () => {
    const ref = vi.fn();

    render(
      <Dialog
        className="custom-dialog"
        data-testid="dialog"
        isOpen
        label="Preferences"
        onOpenChange={() => {}}
        ref={ref}
        style={{color: 'red'}}>
        Content
      </Dialog>,
    );

    const dialog = screen.getByTestId('dialog');
    expect(dialog).toHaveClass('custom-dialog');
    expect(dialog).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(dialog);
  });

  it('focuses a data-autofocus element after opening', async () => {
    render(
      <Dialog isOpen label="Preferences" onOpenChange={() => {}}>
        <button data-autofocus type="button">
          First action
        </button>
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'First action'})).toHaveFocus();
    });
  });
});

describe('useDialog', () => {
  it('opens and hides an imperative dialog', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const dialog = useDialog({label: 'Preview'});

      return (
        <>
          <Button
            label="Open"
            onClick={() => dialog.show(<div>Imperative content</div>)}
          />
          <Button label="Close" onClick={dialog.hide} />
          <span data-testid="status">{dialog.isOpen ? 'open' : 'closed'}</span>
          {dialog.element}
        </>
      );
    }

    render(<Fixture />);

    expect(screen.getByTestId('status')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByTestId('status')).toHaveTextContent('open');
    expect(screen.getByText('Imperative content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.getByTestId('status')).toHaveTextContent('closed');
  });
});
