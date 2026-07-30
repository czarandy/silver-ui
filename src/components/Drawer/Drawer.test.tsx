import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {afterEach, beforeAll, describe, expect, it, vi} from 'vitest';
import {Button} from 'components/Button';
import {Drawer} from 'components/Drawer/Drawer';
import {drawerRecipe} from 'components/Drawer/Drawer.recipe';
import {useDrawer} from 'components/Drawer/useDrawer';
import {Layout, LayoutContent, LayoutHeader} from 'components/Layout';
import {SizeContext} from 'internal/SizeContext';

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

afterEach(() => {
  document.body.style.overflow = '';
});

// The drawer occupies the rect (100,100)-(300,300). Points outside it (e.g.
// 5,5) represent the backdrop; points inside (e.g. 150,150) represent the
// drawer surface or its padding.
function stubDrawerRect(drawer: HTMLElement): void {
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
  drawer.getBoundingClientRect = () => rect;
}

const BACKDROP_POINT = {clientX: 5, clientY: 5};
const INSIDE_POINT = {clientX: 150, clientY: 150};

function pressAndRelease(
  drawer: HTMLElement,
  down: {clientX: number; clientY: number},
  up: {clientX: number; clientY: number},
): void {
  stubDrawerRect(drawer);
  fireEvent.pointerDown(drawer, down);
  fireEvent.click(drawer, {...up, detail: 1});
}

describe('Drawer', () => {
  it('starts a new size cascade for its content', () => {
    render(
      <SizeContext value="lg">
        <Drawer isOpen label="Navigation" onOpenChange={() => {}}>
          <Button label="Save" />
        </Drawer>
      </SizeContext>,
    );

    expect(screen.getByRole('button', {name: 'Save'})).toHaveClass(
      'silver-h_component.md',
    );
  });

  it('opens and renders drawer content', () => {
    render(
      <Drawer isOpen label="Navigation" onOpenChange={() => {}}>
        Drawer content
      </Drawer>,
    );

    expect(screen.getByRole('dialog', {name: 'Navigation'})).toHaveAttribute(
      'open',
    );
    expect(screen.getByText('Drawer content')).toBeInTheDocument();
  });

  it('resets text properties inherited from its DOM ancestry', () => {
    render(
      <div style={{textAlign: 'center', whiteSpace: 'nowrap'}}>
        <Drawer isOpen label="Navigation" onOpenChange={() => {}}>
          Drawer content
        </Drawer>
      </div>,
    );

    const drawer = screen.getByRole('dialog', {name: 'Navigation'});
    expect(drawer).toHaveClass('silver-ta_start');
    expect(drawer).toHaveClass('silver-white-space_normal');
  });

  it('fills its inner surface so a Layout footer stays at the bottom', () => {
    const {inner} = drawerRecipe({state: 'open', placement: 'end'});

    expect(inner).toContain('silver-h_100%');
  });

  it('integrates its close action into LayoutHeader', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Details" onOpenChange={onOpenChange}>
        <Layout
          content={<LayoutContent>Content</LayoutContent>}
          header={<LayoutHeader title="Details" />}
        />
      </Drawer>,
    );

    const closeButton = screen.getByRole('button', {name: 'Close'});
    expect(closeButton).toHaveClass('silver-mbs_-2');

    await user.click(closeButton);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('focuses the LayoutHeader title when no explicit autofocus target exists', async () => {
    render(
      <Drawer isOpen label="Details" onOpenChange={() => {}}>
        <Layout
          content={<LayoutContent>Content</LayoutContent>}
          header={<LayoutHeader title="Details" />}
        />
      </Drawer>,
    );

    await waitFor(() => {
      expect(screen.getByRole('heading', {name: 'Details'})).toHaveFocus();
    });
  });

  it('does not open when isOpen is false', () => {
    render(
      <Drawer
        data-testid="drawer"
        isOpen={false}
        label="Navigation"
        onOpenChange={() => {}}>
        Hidden content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).not.toHaveAttribute('open');
    expect(screen.getByTestId('drawer')).not.toHaveClass('silver-d_flex');
  });

  it('calls onOpenChange(false) on backdrop click', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    pressAndRelease(screen.getByRole('dialog'), BACKDROP_POINT, BACKDROP_POINT);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close when clicking drawer padding inside the rect', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    // A click whose coordinates land inside the drawer's border box (as a
    // click on padding would) must not be treated as a backdrop click.
    pressAndRelease(screen.getByRole('dialog'), INSIDE_POINT, INSIDE_POINT);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not close on an inside-out drag that ends on the backdrop', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    // Press starts inside the drawer (e.g. selecting text) and the release
    // overshoots onto the backdrop: this must not dismiss.
    pressAndRelease(screen.getByRole('dialog'), INSIDE_POINT, BACKDROP_POINT);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('ignores keyboard-synthesized clicks (detail 0) on the drawer', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole('dialog');
    stubDrawerRect(drawer);
    // Enter/Space on a child control bubbles a click with detail 0 and 0,0
    // coordinates — which would otherwise read as "outside the rect".
    fireEvent.click(drawer, {clientX: 0, clientY: 0, detail: 0});
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('does not close when inner content is clicked', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        <button type="button">Inner action</button>
      </Drawer>,
    );

    fireEvent.click(screen.getByRole('button', {name: 'Inner action'}));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('calls onOpenChange(false) on escape', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer isOpen label="Navigation" onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen.getByRole('dialog').dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click when backdrop dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={{isBackdropDismissEnabled: false}}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    pressAndRelease(screen.getByRole('dialog'), BACKDROP_POINT, BACKDROP_POINT);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('still closes on escape when only backdrop dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={{isBackdropDismissEnabled: false}}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen.getByRole('dialog').dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on escape when escape dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={{isEscapeDismissEnabled: false}}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen.getByRole('dialog').dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('restores native open state when a blocked escape closes the drawer', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={false}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole('dialog');
    const cancelEvent = new Event('cancel', {cancelable: true});
    drawer.dispatchEvent(cancelEvent);
    drawer.removeAttribute('open');
    drawer.dispatchEvent(new Event('close'));

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(drawer).toHaveAttribute('open');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('still closes on backdrop click when only escape dismiss is disabled', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={{isEscapeDismissEnabled: false}}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    pressAndRelease(screen.getByRole('dialog'), BACKDROP_POINT, BACKDROP_POINT);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('does not close on backdrop click or escape when dismissBehavior is false', () => {
    const onOpenChange = vi.fn();

    render(
      <Drawer
        dismissBehavior={false}
        isOpen
        label="Navigation"
        onOpenChange={onOpenChange}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByRole('dialog');
    pressAndRelease(drawer, BACKDROP_POINT, BACKDROP_POINT);

    const cancelEvent = new Event('cancel', {cancelable: true});
    drawer.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('defaults placement to right', () => {
    render(
      <Drawer data-testid="drawer" isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveStyle({width: '320px'});
  });

  it('applies default size for each placement', () => {
    const {rerender} = render(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="start">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({width: '320px'});

    rerender(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="end">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({width: '320px'});

    rerender(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="top">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({height: '40vh'});

    rerender(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="bottom">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({height: '40vh'});
  });

  it.each([
    ['start', ['silver-inset-y_0', 'silver-inset-s_0', 'silver-inset-e_auto']],
    ['end', ['silver-inset-y_0', 'silver-inset-s_auto', 'silver-inset-e_0']],
    ['top', ['silver-inset-bs_0', 'silver-inset-be_auto', 'silver-inset-x_0']],
    [
      'bottom',
      ['silver-inset-bs_auto', 'silver-inset-be_0', 'silver-inset-x_0'],
    ],
  ] as const)(
    'anchors the %s placement to its viewport edge',
    (placement, classes) => {
      render(
        <Drawer
          data-testid="drawer"
          isOpen
          label="Nav"
          onOpenChange={() => {}}
          placement={placement}>
          Content
        </Drawer>,
      );

      expect(screen.getByTestId('drawer')).toHaveClass(
        'silver-m_0',
        ...classes,
      );
    },
  );

  it('applies custom size based on placement', () => {
    const {rerender} = render(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="start"
        size={400}>
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({width: '400px'});

    rerender(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="bottom"
        size="50vh">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({height: '50vh'});
  });

  it('applies string size to horizontal placements', () => {
    render(
      <Drawer
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="end"
        size="50vw">
        Content
      </Drawer>,
    );

    expect(screen.getByTestId('drawer')).toHaveStyle({width: '50vw'});
  });

  it('applies className, style, ref, and data-testid', () => {
    const ref = vi.fn();

    render(
      <Drawer
        className="custom-drawer"
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        ref={ref}
        style={{color: 'red'}}>
        Content
      </Drawer>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveClass('custom-drawer');
    expect(drawer).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(drawer);
  });

  it('composes custom className with placement styles', () => {
    render(
      <Drawer
        className="custom-drawer"
        data-testid="drawer"
        isOpen
        label="Nav"
        onOpenChange={() => {}}
        placement="top">
        Content
      </Drawer>,
    );

    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveClass('custom-drawer');
    expect(drawer).toHaveStyle({height: '40vh'});
  });

  it('focuses a data-autofocus element after opening', async () => {
    render(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        <button data-autofocus type="button">
          First action
        </button>
      </Drawer>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'First action'})).toHaveFocus();
    });
  });

  it('locks body overflow while open and restores it when closed', () => {
    document.body.style.overflow = 'scroll';
    const {rerender} = render(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    expect(document.body).toHaveStyle({overflow: 'hidden'});

    rerender(
      <Drawer isOpen={false} label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    expect(document.body).toHaveStyle({overflow: 'scroll'});
  });

  it('restores body overflow when unmounted while open', () => {
    document.body.style.overflow = 'auto';
    const {unmount} = render(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    expect(document.body).toHaveStyle({overflow: 'hidden'});

    unmount();

    expect(document.body).toHaveStyle({overflow: 'auto'});
  });

  it('restores focus to the trigger when closed', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button label="Open drawer" onClick={() => setIsOpen(true)} />
          <Drawer isOpen={isOpen} label="Nav" onOpenChange={setIsOpen}>
            <Button label="Close drawer" onClick={() => setIsOpen(false)} />
          </Drawer>
        </>
      );
    }

    render(<Fixture />);

    const trigger = screen.getByRole('button', {name: 'Open drawer'});
    await user.click(trigger);
    await user.click(screen.getByRole('button', {name: 'Close drawer'}));

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  it('handles rapid open and close updates', () => {
    const {rerender} = render(
      <Drawer isOpen={false} label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    rerender(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );
    rerender(
      <Drawer isOpen={false} label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );
    rerender(
      <Drawer isOpen label="Nav" onOpenChange={() => {}}>
        Content
      </Drawer>,
    );

    expect(screen.getByRole('dialog', {name: 'Nav'})).toHaveAttribute('open');
  });
});

describe('useDrawer', () => {
  it('opens and hides an imperative drawer', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const drawer = useDrawer({label: 'Details'});

      return (
        <>
          <Button
            label="Open"
            onClick={() => drawer.show(<div>Drawer content</div>)}
          />
          <Button label="Close" onClick={drawer.hide} />
          <span data-testid="status">{drawer.isOpen ? 'open' : 'closed'}</span>
          {drawer.element}
        </>
      );
    }

    render(<Fixture />);

    expect(screen.getByTestId('status')).toHaveTextContent('closed');

    await user.click(screen.getByRole('button', {name: 'Open'}));
    expect(screen.getByTestId('status')).toHaveTextContent('open');
    expect(screen.getByText('Drawer content')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Close'}));
    expect(screen.getByTestId('status')).toHaveTextContent('closed');
  });

  it('updates content and merges options when show is called multiple times', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const drawer = useDrawer({label: 'Details', placement: 'end', size: 320});

      return (
        <>
          <Button
            label="Show first"
            onClick={() => drawer.show(<div>First content</div>)}
          />
          <Button
            label="Show second"
            onClick={() =>
              drawer.show(<div>Second content</div>, {
                label: 'Second details',
                placement: 'start',
                size: '45vw',
              })
            }
          />
          {drawer.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByRole('button', {name: 'Show first'}));
    expect(screen.getByText('First content')).toBeInTheDocument();
    expect(screen.getByRole('dialog', {name: 'Details'})).toHaveStyle({
      width: '320px',
    });

    await user.click(screen.getByRole('button', {name: 'Show second'}));
    expect(screen.queryByText('First content')).not.toBeInTheDocument();
    expect(screen.getByText('Second content')).toBeInTheDocument();
    expect(screen.getByRole('dialog', {name: 'Second details'})).toHaveStyle({
      width: '45vw',
    });
  });

  it('does not carry per-call options into a later show() call', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const drawer = useDrawer({label: 'Details', placement: 'end', size: 320});

      return (
        <>
          <Button
            label="Show custom"
            onClick={() =>
              drawer.show(<div>Custom content</div>, {
                label: 'Custom details',
                size: '45vw',
              })
            }
          />
          <Button
            label="Show plain"
            onClick={() => drawer.show(<div>Plain content</div>)}
          />
          {drawer.element}
        </>
      );
    }

    render(<Fixture />);

    // First show overrides the label and size.
    await user.click(screen.getByRole('button', {name: 'Show custom'}));
    expect(screen.getByRole('dialog', {name: 'Custom details'})).toHaveStyle({
      width: '45vw',
    });

    // Second show passes no options, so the previous call's overrides are
    // dropped and the drawer reverts to the default label and size.
    await user.click(screen.getByRole('button', {name: 'Show plain'}));
    expect(screen.getByText('Plain content')).toBeInTheDocument();
    expect(screen.queryByText('Custom content')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', {name: 'Details'})).toHaveStyle({
      width: '320px',
    });
  });

  it('uses default placement option', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const drawer = useDrawer({label: 'Menu', placement: 'bottom'});

      return (
        <>
          <Button
            label="Open"
            onClick={() => drawer.show(<div>Drawer content</div>)}
          />
          {drawer.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByRole('button', {name: 'Open'}));

    expect(screen.getByRole('dialog', {name: 'Menu'})).toHaveStyle({
      height: '40vh',
    });
  });
});

function UnmountFixture({
  hasDrawer,
  isOpen,
}: {
  hasDrawer: boolean;
  isOpen: boolean;
}): React.JSX.Element {
  return (
    <>
      <button type="button">Trigger</button>
      {hasDrawer ? (
        <Drawer
          data-testid="drawer"
          isOpen={isOpen}
          label="Nav"
          onOpenChange={() => {}}>
          <button data-autofocus="true" type="button">
            Inside
          </button>
        </Drawer>
      ) : null}
    </>
  );
}

describe('Drawer exit animation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function renderDrawer(isOpen: boolean) {
    return <UnmountFixture hasDrawer isOpen={isOpen} />;
  }

  it('slides out before closing, then restores focus to the trigger', () => {
    vi.useFakeTimers();
    const {rerender} = render(renderDrawer(false));
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    act(() => {
      trigger.focus();
    });

    rerender(renderDrawer(true));
    expect(screen.getByRole('button', {name: 'Inside'})).toHaveFocus();

    rerender(renderDrawer(false));
    // The exit transition is still playing: the drawer stays open and focus
    // has not yet returned to the trigger.
    expect(screen.getByTestId('drawer')).toHaveAttribute('open');
    expect(trigger).not.toHaveFocus();

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByTestId('drawer')).not.toHaveAttribute('open');
    expect(trigger).toHaveFocus();
  });

  it('cancels the deferred close when reopened mid-exit', () => {
    vi.useFakeTimers();
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');
    const {rerender} = render(renderDrawer(true));

    rerender(renderDrawer(false));
    rerender(renderDrawer(true));

    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(closeSpy).not.toHaveBeenCalled();
    expect(screen.getByTestId('drawer')).toHaveAttribute('open');
  });

  it('closes almost immediately under reduced motion', () => {
    vi.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        addEventListener: vi.fn(),
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        removeEventListener: vi.fn(),
      }),
    });

    const {rerender} = render(renderDrawer(true));
    rerender(renderDrawer(false));
    expect(screen.getByTestId('drawer')).toHaveAttribute('open');

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('drawer')).not.toHaveAttribute('open');

    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('restores focus to the trigger when unmounted mid-exit', () => {
    vi.useFakeTimers();

    const {rerender} = render(<UnmountFixture hasDrawer isOpen={false} />);
    const trigger = screen.getByRole('button', {name: 'Trigger'});
    act(() => {
      trigger.focus();
    });

    rerender(<UnmountFixture hasDrawer isOpen />);
    rerender(<UnmountFixture hasDrawer isOpen={false} />);
    // Unmount only the drawer mid-exit; the trigger stays in the document.
    rerender(<UnmountFixture hasDrawer={false} isOpen={false} />);

    expect(trigger).toHaveFocus();
    expect(document.body).not.toHaveStyle({overflow: 'hidden'});
  });
});

describe('drawerRecipe animation atoms', () => {
  function rootAtoms(
    state: 'open' | 'closing' | 'closed',
    placement: 'start' | 'end' | 'top' | 'bottom',
  ): string[] {
    return (drawerRecipe({state, placement}).root ?? '').split(' ');
  }

  it('slides from the placement edge with an RTL-aware offset', () => {
    const endAtoms = rootAtoms('open', 'end');
    expect(endAtoms).toContain(
      '[@starting-style]:silver-translate_var(--drawer-hidden-translate)',
    );
    expect(endAtoms).toContain('silver---drawer-hidden-translate_100%_0');
    expect(endAtoms).toContain('rtl:silver---drawer-hidden-translate_-100%_0');
    expect(endAtoms).toContain('backdrop:[@starting-style]:silver-op_0');
    expect(endAtoms).toContain(
      '[@media_(prefers-reduced-motion:_reduce)]:silver-trs-dur_0.01s',
    );

    const startAtoms = rootAtoms('open', 'start');
    expect(startAtoms).toContain('silver---drawer-hidden-translate_-100%_0');
    expect(startAtoms).toContain('rtl:silver---drawer-hidden-translate_100%_0');

    expect(rootAtoms('open', 'top')).toContain(
      'silver---drawer-hidden-translate_0_-100%',
    );
    expect(rootAtoms('open', 'bottom')).toContain(
      'silver---drawer-hidden-translate_0_100%',
    );
  });

  it('keeps layout only under [open] while closing and moves off-edge', () => {
    const atoms = rootAtoms('closing', 'end');

    expect(atoms).toContain('[&[open]]:silver-d_flex');
    expect(atoms).not.toContain('silver-d_flex');
    expect(atoms).toContain('silver-translate_var(--drawer-hidden-translate)');
    expect(atoms).toContain('backdrop:silver-op_0');
  });

  it('authors no display when closed so the UA default hides the drawer', () => {
    const atoms = rootAtoms('closed', 'end');

    expect(atoms).not.toContain('silver-d_flex');
    expect(atoms).not.toContain('[&[open]]:silver-d_flex');
  });
});
