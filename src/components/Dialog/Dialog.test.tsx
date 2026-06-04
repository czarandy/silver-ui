import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from '../Button';
import {LayoutHeader} from '../Layout';
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

  it('calls onOpenChange(false) on backdrop click by default', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
        Content
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click when backdrop dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        dismissBehavior={{isBackdropDismissEnabled: false}}
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}>
        Content
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('dialog'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('uses alertdialog role and blocks escape when escape dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        dismissBehavior={{isEscapeDismissEnabled: false}}
        isOpen
        label="Preferences"
        onOpenChange={onOpenChange}
        role="alertdialog">
        Content
      </Dialog>,
    );

    const dialog = screen.getByRole('alertdialog');
    const cancelEvent = new Event('cancel', {cancelable: true});
    dialog.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) on cancel by default', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
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

  it('prefers [data-autofocus] over dialog heading for initial focus', async () => {
    render(
      <Dialog isOpen label="Form" onOpenChange={() => {}}>
        <LayoutHeader title="Form title" />
        <input data-autofocus="true" data-testid="name-input" />
      </Dialog>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('name-input')).toHaveFocus();
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

describe('Dialog additional', () => {
  it('does not close on backdrop click when dismissBehavior is false', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog
        dismissBehavior={false}
        isOpen
        label="Alert"
        onOpenChange={onOpenChange}
        role="alertdialog">
        Content
      </Dialog>,
    );

    fireEvent.click(screen.getByRole('alertdialog'));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('restores body overflow when closed', () => {
    document.body.style.overflow = 'scroll';

    const {rerender} = render(
      <Dialog isOpen label="Test" onOpenChange={() => {}}>
        Content
      </Dialog>,
    );

    expect(document.body).toHaveStyle({overflow: 'hidden'});

    rerender(
      <Dialog isOpen={false} label="Test" onOpenChange={() => {}}>
        Content
      </Dialog>,
    );

    expect(document.body).toHaveStyle({overflow: 'scroll'});
    document.body.style.overflow = '';
  });
});

describe('LayoutHeader in Dialog', () => {
  it('renders title and subtitle', () => {
    render(
      <Dialog isOpen label="Test" onOpenChange={() => {}}>
        <LayoutHeader subtitle="Helper text" title="My Title" />
      </Dialog>,
    );

    expect(screen.getByRole('heading', {name: 'My Title'})).toBeInTheDocument();
    expect(screen.getByText('Helper text')).toBeInTheDocument();
  });

  it('renders a close button from dialog context', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Test" onOpenChange={onOpenChange}>
        <LayoutHeader title="Title" />
      </Dialog>,
    );

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('uses aria-labelledby when LayoutHeader is present and label is omitted', () => {
    render(
      <Dialog isOpen onOpenChange={() => {}}>
        <LayoutHeader title="Heading title" />
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', {name: 'Heading title'});
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(dialog).toHaveAttribute('aria-labelledby');

    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(labelledById).toBeDefined();
    expect(
      within(dialog).getByRole('heading', {name: 'Heading title'}),
    ).toHaveAttribute('id', labelledById);
  });

  it('falls back to aria-label when no LayoutHeader is present', () => {
    render(
      <Dialog isOpen label="Standalone label" onOpenChange={() => {}}>
        <p>No header here</p>
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog', {name: 'Standalone label'});
    expect(dialog).toHaveAttribute('aria-label', 'Standalone label');
    expect(dialog).not.toHaveAttribute('aria-labelledby');
  });

  it('does not render a close button outside dialog context', () => {
    render(<LayoutHeader title="Title" />);

    expect(
      screen.queryByRole('button', {name: 'Close'}),
    ).not.toBeInTheDocument();
  });

  it('renders startContent and endContent', () => {
    render(
      <LayoutHeader
        endContent={<span data-testid="end">End</span>}
        startContent={<span data-testid="start">Start</span>}
        title="Title"
      />,
    );

    expect(screen.getByTestId('start')).toBeInTheDocument();
    expect(screen.getByTestId('end')).toBeInTheDocument();
  });
});
