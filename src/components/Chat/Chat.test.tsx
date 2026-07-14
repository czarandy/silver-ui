import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChatComposer} from 'components/Chat/ChatComposer';
import {ChatLayout} from 'components/Chat/ChatLayout';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageList} from 'components/Chat/ChatMessageList';
import {ChatScrollButton} from 'components/Chat/ChatScrollButton';

type ResizeCallback = (entries: {target: Element}[]) => void;

const resizeCallbacks = new Map<Element, ResizeCallback>();

class ResizeObserverStub {
  callback: ResizeCallback;

  constructor(callback: ResizeCallback) {
    this.callback = callback;
  }

  observe(element: Element): void {
    resizeCallbacks.set(element, this.callback);
  }

  unobserve(element: Element): void {
    resizeCallbacks.delete(element);
  }

  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  resizeCallbacks.clear();
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
    expect(layout).toHaveAttribute('data-density', 'balanced');

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 400,
    });
    resizeCallbacks.get(layout)?.([{target: layout}]);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'compact'),
    );

    Object.defineProperty(layout, 'clientWidth', {
      configurable: true,
      value: 1000,
    });
    resizeCallbacks.get(layout)?.([{target: layout}]);
    await waitFor(() =>
      expect(layout).toHaveAttribute('data-density', 'spacious'),
    );
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
});
