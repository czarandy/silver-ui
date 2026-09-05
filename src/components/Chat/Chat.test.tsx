import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChatComposer} from 'components/Chat/ChatComposer';
import {ChatLayout} from 'components/Chat/ChatLayout';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageList} from 'components/Chat/ChatMessageList';
import {ChatScrollButton} from 'components/Chat/ChatScrollButton';
import {createResizeObserverStub} from 'internal/testHelpers';

const resizeObserver = createResizeObserverStub();

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', resizeObserver.ResizeObserverStub);
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  resizeObserver.reset();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderLayout(props: Partial<Parameters<typeof ChatLayout>[0]> = {}) {
  return render(
    <ChatLayout
      composer={<ChatComposer onSubmit={() => {}} />}
      data-testid="layout"
      {...props}>
      <ChatMessageList>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>
    </ChatLayout>,
  );
}

describe('ChatLayout', () => {
  it('renders messages and the composer', () => {
    renderLayout();

    expect(screen.getByRole('log')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type a message…')).toBeInTheDocument();
  });

  it('updates density from the observed root width', async () => {
    renderLayout();

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('data-density', 'compact');

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 600,
    });
    resizeObserver.resize(layout);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'balanced'),
    );

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    resizeObserver.resize(layout);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'spacious'),
    );
  });

  it('keeps the message and composer column widths stable while density resolves', async () => {
    renderLayout();

    const layout = screen.getByTestId('layout');
    // These layout slots are intentionally structural and have no semantic
    // roles. Their max-width classes must not change when hydration replaces
    // the fallback density with the measured one.
    // eslint-disable-next-line testing-library/no-node-access -- structural message-area slot
    const messageArea = layout.firstElementChild as HTMLElement;
    // eslint-disable-next-line testing-library/no-node-access -- structural dock-container slot
    const dock = layout.lastElementChild as HTMLElement;
    // eslint-disable-next-line testing-library/no-node-access -- structural dock slot
    const dockInner = dock.lastElementChild?.firstElementChild as HTMLElement;
    const maxWidthClasses = (element: HTMLElement): string[] =>
      [...element.classList].filter(className => className.includes('max-w'));
    const initialMessageAreaMaxWidth = maxWidthClasses(messageArea);
    const initialDockMaxWidth = maxWidthClasses(dockInner);

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    resizeObserver.resize(layout);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'spacious'),
    );

    expect(initialMessageAreaMaxWidth).toEqual(['silver-max-w_800px']);
    expect(initialDockMaxWidth).toEqual(['silver-max-w_800px']);
    expect(maxWidthClasses(messageArea)).toEqual(initialMessageAreaMaxWidth);
    expect(maxWidthClasses(dockInner)).toEqual(initialDockMaxWidth);
  });

  it('applies the initial measured density before an observer callback', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);

    renderLayout();

    expect(screen.getByTestId('layout')).toHaveAttribute(
      'data-density',
      'spacious',
    );
  });

  it('flows its responsive density to the composer', async () => {
    render(
      <ChatLayout
        composer={<ChatComposer data-testid="composer" onSubmit={() => {}} />}
        data-testid="layout"
      />,
    );

    const layout = screen.getByTestId('layout');
    const composer = screen.getByTestId('composer');
    // The composer body is a structural slot without a role.
    // eslint-disable-next-line testing-library/no-node-access -- see above
    const composerBody = composer.firstElementChild;
    const initialClasses = composerBody?.className;

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    resizeObserver.resize(layout);

    await waitFor(() =>
      expect(composerBody?.className).not.toBe(initialClasses),
    );
  });

  it('lets an explicit composer density override the layout density', async () => {
    render(
      <ChatLayout
        composer={
          <ChatComposer
            data-testid="composer"
            density="spacious"
            onSubmit={() => {}}
          />
        }
        data-testid="layout"
      />,
    );

    const layout = screen.getByTestId('layout');
    const composer = screen.getByTestId('composer');
    // The composer body is a structural slot without a role.
    // eslint-disable-next-line testing-library/no-node-access -- see above
    const composerBody = composer.firstElementChild;
    const spaciousClasses = composerBody?.className;

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 400,
    });
    resizeObserver.resize(layout);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'compact'),
    );

    expect(composerBody?.className).toBe(spaciousClasses);
  });

  it('shows the empty state only when there are no messages', () => {
    render(
      <ChatLayout
        composer={<ChatComposer onSubmit={() => {}} />}
        emptyState={<span data-testid="empty" />}
      />,
    );

    expect(screen.getByTestId('empty')).toBeInTheDocument();
  });

  it('renders the default scroll button', () => {
    renderLayout();

    expect(
      screen.getByRole('button', {name: 'Scroll to bottom'}),
    ).toBeInTheDocument();
  });

  it('hides the scroll button when null', () => {
    renderLayout({scrollButton: null});

    expect(
      screen.queryByRole('button', {name: 'Scroll to bottom'}),
    ).not.toBeInTheDocument();
  });

  it('renders a custom scroll button', () => {
    renderLayout({scrollButton: <span data-testid="custom-button" />});

    expect(screen.getByTestId('custom-button')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Scroll to bottom'}),
    ).not.toBeInTheDocument();
  });

  it('floats the scroll button in its own container above the dock', () => {
    renderLayout();

    const layout = screen.getByTestId('layout');
    const button = screen.getByRole('button', {name: 'Scroll to bottom'});
    // The floating container is the dock container's first child; it keeps
    // the button out of flow so it reserves no height above the composer.
    // eslint-disable-next-line testing-library/no-node-access -- structural slots without roles
    const scrollButtonContainer = layout.lastElementChild?.firstElementChild;
    expect(scrollButtonContainer).toContainElement(button);
  });

  it('reserves the measured dock height with an external scroll container', async () => {
    const external = document.createElement('div');
    document.body.append(external);
    renderLayout({scrollRef: {current: external}});

    const layout = screen.getByTestId('layout');
    // The dock and message area are structural slots without roles, so they
    // are located relative to the layout root.
    // eslint-disable-next-line testing-library/no-node-access -- see above
    const dock = layout.lastElementChild as HTMLElement;
    Object.defineProperty(dock, 'offsetHeight', {
      configurable: true,
      value: 120,
    });
    resizeObserver.resize(dock);

    // The fixed dock is out of the external container's flow, so the
    // message area must pad by the measured dock height.
    await waitFor(() =>
      // eslint-disable-next-line testing-library/no-node-access -- see above
      expect(layout.firstElementChild).toHaveStyle({
        paddingBlockEnd: '120px',
      }),
    );
  });

  it('excludes the measured dock height from the message area minimum when self-scrolling', async () => {
    renderLayout();

    const layout = screen.getByTestId('layout');
    // The dock and message area are structural slots without roles, so they
    // are located relative to the layout root.
    // eslint-disable-next-line testing-library/no-node-access -- see above
    const dock = layout.lastElementChild as HTMLElement;
    Object.defineProperty(dock, 'offsetHeight', {
      configurable: true,
      value: 120,
    });
    resizeObserver.resize(dock);

    // The sticky dock stays in flow after the message area, so its height
    // must come out of the area's 100% minimum or a short history gains a
    // dock-height scroll range that lets the last message slide underneath
    // the composer.
    await waitFor(() =>
      // eslint-disable-next-line testing-library/no-node-access -- see above
      expect(layout.firstElementChild).toHaveStyle({
        minHeight: 'calc(100% - 120px)',
      }),
    );
  });

  it('reserves the initial dock height before an observer callback', () => {
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(120);

    renderLayout();

    const layout = screen.getByTestId('layout');
    // eslint-disable-next-line testing-library/no-node-access -- structural message-area slot
    expect(layout.firstElementChild).toHaveStyle({
      minHeight: 'calc(100% - 120px)',
    });
  });

  it('remeasures a density-dependent dock before an observer callback', () => {
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(
      function (this: HTMLElement) {
        return this.parentElement?.dataset.density === 'spacious' ? 114 : 106;
      },
    );

    renderLayout();

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('data-density', 'spacious');
    // eslint-disable-next-line testing-library/no-node-access -- structural message-area slot
    expect(layout.firstElementChild).toHaveStyle({
      minHeight: 'calc(100% - 114px)',
    });
  });

  it('applies className, style, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ChatLayout
        className="custom-layout"
        composer={null}
        data-testid="layout"
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveClass('custom-layout');
    expect(layout).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards the curated passthrough props to the root', () => {
    render(
      <>
        <span id="chat-label">Support chat</span>
        <ChatLayout
          aria-labelledby="chat-label"
          composer={null}
          data-testid="layout"
          id="chat"
        />
      </>,
    );

    const layout = screen.getByTestId('layout');
    expect(layout).toHaveAttribute('id', 'chat');
    expect(layout).toHaveAttribute('aria-labelledby', 'chat-label');
  });
});

describe('ChatScrollButton', () => {
  it('calls onClick when pressed', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ChatScrollButton isVisible onClick={onClick} />);

    await user.click(screen.getByRole('button', {name: 'Scroll to bottom'}));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows the label when provided', () => {
    render(
      <ChatScrollButton isVisible label="New messages" onClick={() => {}} />,
    );

    expect(
      screen.getByRole('button', {name: 'New messages'}),
    ).toBeInTheDocument();
  });

  it('changes classes between hidden and visible', () => {
    const {rerender} = render(
      <ChatScrollButton
        data-testid="scroll-button"
        isVisible={false}
        onClick={() => {}}
      />,
    );
    const hiddenPill =
      screen.getByTestId('scroll-button').firstElementChild?.className;

    rerender(
      <ChatScrollButton
        data-testid="scroll-button"
        isVisible
        onClick={() => {}}
      />,
    );

    expect(
      screen.getByTestId('scroll-button').firstElementChild?.className,
    ).not.toBe(hiddenPill);
  });

  it('disables pill transitions for reduced motion preferences', () => {
    render(
      <ChatScrollButton
        data-testid="scroll-button"
        isVisible
        onClick={() => {}}
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access -- the decorative pill is intentionally not exposed through an accessibility query
    const pill = screen.getByTestId('scroll-button').firstElementChild;
    expect(pill?.className).toContain('prefers-reduced-motion');
    expect(pill?.className).toContain('silver-trs-dur_0s');
  });

  it('forwards the shared button passthrough props to the button', () => {
    render(
      <>
        <span id="scroll-hint">Jump to the latest message</span>
        <ChatScrollButton
          aria-describedby="scroll-hint"
          aria-keyshortcuts="Meta+ArrowDown"
          id="scroll-to-bottom"
          isVisible
          onClick={() => {}}
        />
      </>,
    );

    const button = screen.getByRole('button', {name: 'Scroll to bottom'});
    expect(button).toHaveAttribute('id', 'scroll-to-bottom');
    // The icon-only tooltip appends its own id, so the consumer's survives
    // alongside it rather than replacing it.
    expect(button).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('scroll-hint'),
    );
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+ArrowDown');
  });
});
