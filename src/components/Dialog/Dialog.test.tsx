import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog/Dialog';
import {useDialog} from 'components/Dialog/useDialog';
import {LayoutHeader} from 'components/Layout';

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

// The dialog occupies the rect (100,100)-(300,300). Points outside it (e.g.
// 5,5) represent the backdrop; points inside (e.g. 150,150) represent the
// dialog surface or its padding.
function stubDialogRect(dialog: HTMLElement): void {
  const rect: DOMRect = {
    bottom: 300,
    height: 200,
    left: 100,
    right: 300,
    toJSON: () => ({}),
    top: 100,
    width: 200,
    x: 100,
    y: 100,
  };
  dialog.getBoundingClientRect = () => rect;
}

const BACKDROP_POINT = {clientX: 5, clientY: 5};
const INSIDE_POINT = {clientX: 150, clientY: 150};

function pressAndRelease(
  dialog: HTMLElement,
  down: {clientX: number; clientY: number},
  up: {clientX: number; clientY: number},
): void {
  stubDialogRect(dialog);
  fireEvent.pointerDown(dialog, down);
  fireEvent.click(dialog, {...up, detail: 1});
}

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

    pressAndRelease(screen.getByRole('dialog'), BACKDROP_POINT, BACKDROP_POINT);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when clicking dialog padding inside the rect', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
        Content
      </Dialog>,
    );

    // A click whose coordinates land inside the dialog's border box (as a
    // click on padding would) must not be treated as a backdrop click.
    pressAndRelease(screen.getByRole('dialog'), INSIDE_POINT, INSIDE_POINT);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not close on an inside-out drag that ends on the backdrop', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
        Content
      </Dialog>,
    );

    // Press starts inside the dialog (e.g. selecting text) and the release
    // overshoots onto the backdrop: this must not dismiss.
    pressAndRelease(screen.getByRole('dialog'), INSIDE_POINT, BACKDROP_POINT);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('ignores keyboard-synthesized clicks (detail 0) on the dialog', () => {
    const onOpenChange = vi.fn();

    render(
      <Dialog isOpen label="Preferences" onOpenChange={onOpenChange}>
        Content
      </Dialog>,
    );

    const dialog = screen.getByRole('dialog');
    stubDialogRect(dialog);
    // Enter/Space on a child control bubbles a click with detail 0 and 0,0
    // coordinates — which would otherwise read as "outside the rect".
    fireEvent.click(dialog, {clientX: 0, clientY: 0, detail: 0});
    expect(onOpenChange).not.toHaveBeenCalled();
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

    pressAndRelease(screen.getByRole('dialog'), BACKDROP_POINT, BACKDROP_POINT);
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

  it('applies numeric width and maxHeight as pixels', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen
        label="Preferences"
        maxHeight={300}
        onOpenChange={() => {}}
        width={520}>
        Content
      </Dialog>,
    );

    expect(screen.getByTestId('dialog')).toHaveStyle({
      maxHeight: '300px',
      width: '520px',
    });
  });

  it('passes string maxHeight through unchanged', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen
        label="Preferences"
        maxHeight="60vh"
        onOpenChange={() => {}}>
        Content
      </Dialog>,
    );

    expect(screen.getByTestId('dialog')).toHaveStyle({maxHeight: '60vh'});
  });

  it('pins standard dialogs on every edge so auto margins center them', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen
        label="Preferences"
        onOpenChange={() => {}}>
        Content
      </Dialog>,
    );

    expect(screen.getByTestId('dialog')).toHaveClass('silver-inset_0');
    expect(screen.getByTestId('dialog')).toHaveClass('silver-m_auto');
  });

  it('applies fixed position offsets and pins the remaining edges to auto', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen
        label="Preferences"
        onOpenChange={() => {}}
        position={{left: 30, top: 20}}>
        Content
      </Dialog>,
    );

    expect(screen.getByTestId('dialog')).toHaveStyle({
      bottom: 'auto',
      left: '30px',
      margin: '0px',
      right: 'auto',
      top: '20px',
    });
  });

  it('ignores position in the fullscreen variant', () => {
    render(
      <Dialog
        data-testid="dialog"
        isOpen
        label="Preferences"
        onOpenChange={() => {}}
        position={{left: 30, top: 20}}
        variant="fullscreen">
        Content
      </Dialog>,
    );

    // Fullscreen pins itself via the recipe (inset: 0), so the inline
    // position offsets are not applied.
    const dialog = screen.getByTestId('dialog');
    expect(dialog).not.toHaveStyle({left: '30px', top: '20px'});
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

  it('does not carry per-call options into a later show() call', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const dialog = useDialog({label: 'Preview'});

      return (
        <>
          <Button
            label="Open as alert"
            onClick={() =>
              dialog.show(<div>First content</div>, {
                className: 'first-class',
                role: 'alertdialog',
              })
            }
          />
          <Button
            label="Open plain"
            onClick={() => dialog.show(<div>Second content</div>)}
          />
          {dialog.element}
        </>
      );
    }

    render(<Fixture />);

    // First show sets role and className.
    await user.click(screen.getByRole('button', {name: 'Open as alert'}));
    const alertDialog = screen.getByRole('alertdialog');
    expect(alertDialog).toHaveClass('first-class');
    expect(screen.getByText('First content')).toBeInTheDocument();

    // Second show passes no options, so the previous call's options are
    // dropped: the dialog reverts to a plain dialog with the default label.
    await user.click(screen.getByRole('button', {name: 'Open plain'}));
    expect(screen.getByText('Second content')).toBeInTheDocument();
    const dialog = screen.getByRole('dialog', {name: 'Preview'});
    expect(dialog).not.toHaveClass('first-class');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.queryByText('First content')).not.toBeInTheDocument();
  });

  it('labels the dialog via the LayoutHeader heading when no label is given', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const dialog = useDialog();

      return (
        <>
          <Button
            label="Open"
            onClick={() =>
              dialog.show(<LayoutHeader title="Generated report" />)
            }
          />
          {dialog.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByRole('button', {name: 'Open'}));

    // The heading provides the accessible name via aria-labelledby — there
    // is no duplicate generic aria-label.
    const dialog = screen.getByRole('dialog', {name: 'Generated report'});
    expect(dialog).not.toHaveAttribute('aria-label');
    expect(dialog).toHaveAttribute('aria-labelledby');

    const labelledById = dialog.getAttribute('aria-labelledby');
    expect(
      within(dialog).getByRole('heading', {name: 'Generated report'}),
    ).toHaveAttribute('id', labelledById);
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

    pressAndRelease(
      screen.getByRole('alertdialog'),
      BACKDROP_POINT,
      BACKDROP_POINT,
    );
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
