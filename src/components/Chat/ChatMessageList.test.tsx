import {render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageList} from 'components/Chat/ChatMessageList';

type IntersectionCallback = (entries: {isIntersecting: boolean}[]) => void;

const intersectionCallbacks: IntersectionCallback[] = [];

class IntersectionObserverStub {
  callback: IntersectionCallback;

  constructor(callback: IntersectionCallback) {
    this.callback = callback;
    intersectionCallbacks.push(callback);
  }

  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);
});

afterEach(() => {
  intersectionCallbacks.length = 0;
  vi.unstubAllGlobals();
});

describe('ChatMessageList', () => {
  it('renders a polite log', () => {
    render(
      <ChatMessageList>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );

    const log = screen.getByRole('log');
    expect(log).toHaveAttribute('aria-live', 'polite');
  });

  it('flows density to child messages via context', () => {
    render(
      <ChatMessageList density="compact">
        <ChatMessage data-testid="message" sender="user">
          Hi
        </ChatMessage>
      </ChatMessageList>,
    );
    const compactClasses = screen.getByTestId('message').className;

    render(
      <ChatMessageList density="spacious">
        <ChatMessage data-testid="message-spacious" sender="user">
          Hi
        </ChatMessage>
      </ChatMessageList>,
    );

    expect(screen.getByTestId('message-spacious')).not.toHaveClass(
      compactClasses,
      {exact: true},
    );
  });

  it('applies a gap override', () => {
    const {rerender} = render(
      <ChatMessageList data-testid="list">
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );
    const defaultInnerClasses =
      screen.getByTestId('list').firstElementChild?.className;

    rerender(
      <ChatMessageList data-testid="list" gap={0.5}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );

    expect(screen.getByTestId('list').firstElementChild?.className).not.toBe(
      defaultInnerClasses,
    );
  });

  it('shows the empty state only when there are no messages', () => {
    const {rerender} = render(
      <ChatMessageList emptyState={<span data-testid="empty" />} />,
    );
    expect(screen.getByTestId('empty')).toBeInTheDocument();

    rerender(
      <ChatMessageList emptyState={<span data-testid="empty" />}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );
    expect(screen.queryByTestId('empty')).not.toBeInTheDocument();
  });

  it('runs scrollToTopAction when the top sentinel intersects', async () => {
    let resolveAction: () => void = () => {};
    const scrollToTopAction = vi.fn(
      async () =>
        new Promise<void>(resolve => {
          resolveAction = resolve;
        }),
    );

    render(
      <ChatMessageList scrollToTopAction={scrollToTopAction}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );

    expect(intersectionCallbacks).toHaveLength(1);
    intersectionCallbacks[0]([{isIntersecting: true}]);

    await waitFor(() => expect(scrollToTopAction).toHaveBeenCalledOnce());
    // The pending transition shows a loading spinner at the top.
    expect(await screen.findByLabelText('Loading')).toBeInTheDocument();

    resolveAction();
    await waitFor(() =>
      expect(screen.queryByLabelText('Loading')).not.toBeInTheDocument(),
    );
  });

  it('keeps the observer stable when the action identity changes', async () => {
    const firstAction = vi.fn(async () => {});
    const {rerender} = render(
      <ChatMessageList scrollToTopAction={firstAction}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );
    expect(intersectionCallbacks).toHaveLength(1);

    // A parent completing a page load typically passes a new function
    // closing over the next cursor. This must not recreate the observer —
    // a recreated observer fires again while the sentinel is still
    // intersecting and would chain-load every page.
    const secondAction = vi.fn(async () => {});
    rerender(
      <ChatMessageList scrollToTopAction={secondAction}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );
    expect(intersectionCallbacks).toHaveLength(1);

    // The observer still invokes the latest action, not the stale one.
    intersectionCallbacks[0]([{isIntersecting: true}]);
    await waitFor(() => expect(secondAction).toHaveBeenCalledOnce());
    expect(firstAction).not.toHaveBeenCalled();
  });

  it('does not observe intersections without scrollToTopAction', () => {
    render(
      <ChatMessageList>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );

    expect(intersectionCallbacks).toHaveLength(0);
  });

  it('applies className, style, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ChatMessageList
        className="custom-list"
        data-testid="list"
        ref={ref}
        style={{color: 'red'}}>
        <ChatMessage sender="user">Hi</ChatMessage>
      </ChatMessageList>,
    );

    const list = screen.getByTestId('list');
    expect(list).toHaveClass('custom-list');
    expect(list).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
