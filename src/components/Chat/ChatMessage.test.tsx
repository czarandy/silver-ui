import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageBubble} from 'components/Chat/ChatMessageBubble';
import {ChatMessageMetadata} from 'components/Chat/ChatMessageMetadata';
import {ChatSystemMessage} from 'components/Chat/ChatSystemMessage';

describe('ChatMessage', () => {
  it('renders an article with message data attributes', () => {
    render(
      <ChatMessage data-testid="message" sender="user">
        Hello
      </ChatMessage>,
    );

    const message = screen.getByTestId('message');
    expect(message.tagName).toBe('ARTICLE');
    expect(message).toHaveAttribute('data-chat-message');
    expect(message).toHaveAttribute('data-sender', 'user');
  });

  it('labels the message from the sender when no name is given', () => {
    render(<ChatMessage sender="assistant">Hi</ChatMessage>);

    expect(
      screen.getByRole('article', {name: 'Message from assistant'}),
    ).toBeInTheDocument();
  });

  it('labels the message with the name when given', () => {
    render(
      <ChatMessage name="Navi" sender="assistant">
        Hi
      </ChatMessage>,
    );

    const message = screen.getByRole('article', {name: 'Navi'});
    expect(message).toHaveAttribute('aria-labelledby');
    expect(screen.getByText('Navi')).toBeInTheDocument();
  });

  it('renders avatar and metadata slots', () => {
    render(
      <ChatMessage
        avatar={<span data-testid="avatar" />}
        metadata={<span data-testid="metadata" />}
        sender="assistant">
        Hi
      </ChatMessage>,
    );

    expect(screen.getByTestId('avatar')).toBeInTheDocument();
    expect(screen.getByTestId('metadata')).toBeInTheDocument();
  });

  it('omits avatar, name, and metadata for system messages', () => {
    render(
      <ChatMessage
        avatar={<span data-testid="avatar" />}
        metadata={<span data-testid="metadata" />}
        name="Bot"
        sender="system">
        Conversation started
      </ChatMessage>,
    );

    expect(screen.queryByTestId('avatar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metadata')).not.toBeInTheDocument();
    expect(screen.queryByText('Bot')).not.toBeInTheDocument();
  });

  it('applies different classes per sender', () => {
    const {rerender} = render(
      <ChatMessage data-testid="message" sender="assistant">
        Hi
      </ChatMessage>,
    );
    const assistantClasses = screen.getByTestId('message').className;

    rerender(
      <ChatMessage data-testid="message" sender="user">
        Hi
      </ChatMessage>,
    );

    expect(screen.getByTestId('message')).not.toHaveClass(assistantClasses, {
      exact: true,
    });
  });

  it('applies className, style, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLElement | null) => void>();

    render(
      <ChatMessage
        className="custom-message"
        data-testid="message"
        ref={ref}
        sender="user"
        style={{color: 'red'}}>
        Hi
      </ChatMessage>,
    );

    const message = screen.getByTestId('message');
    expect(message).toHaveClass('custom-message');
    expect(message).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLElement));
  });
});

describe('ChatMessageBubble', () => {
  it('renders bubble content', () => {
    render(
      <ChatMessage sender="user">
        <ChatMessageBubble data-testid="bubble">Hello!</ChatMessageBubble>
      </ChatMessage>,
    );

    expect(screen.getByTestId('bubble')).toHaveTextContent('Hello!');
  });

  it('applies different classes for the ghost variant', () => {
    const {rerender} = render(
      <ChatMessageBubble data-testid="bubble">Hi</ChatMessageBubble>,
    );
    const filledClasses = screen.getByTestId('bubble').className;

    rerender(
      <ChatMessageBubble data-testid="bubble" variant="ghost">
        Hi
      </ChatMessageBubble>,
    );

    expect(screen.getByTestId('bubble')).not.toHaveClass(filledClasses, {
      exact: true,
    });
  });

  it('applies sender-dependent group corner classes', () => {
    const renderGrouped = (sender: 'assistant' | 'user') =>
      render(
        <ChatMessage sender={sender}>
          <ChatMessageBubble data-testid={`bubble-${sender}`} group="middle">
            Hi
          </ChatMessageBubble>
        </ChatMessage>,
      );

    renderGrouped('assistant');
    renderGrouped('user');

    expect(screen.getByTestId('bubble-assistant')).not.toHaveClass(
      screen.getByTestId('bubble-user').className,
      {exact: true},
    );
  });

  it('changes classes when grouped', () => {
    const {rerender} = render(
      <ChatMessage sender="user">
        <ChatMessageBubble data-testid="bubble">Hi</ChatMessageBubble>
      </ChatMessage>,
    );
    const standalone = screen.getByTestId('bubble').className;

    rerender(
      <ChatMessage sender="user">
        <ChatMessageBubble data-testid="bubble" group="first">
          Hi
        </ChatMessageBubble>
      </ChatMessage>,
    );

    expect(screen.getByTestId('bubble')).not.toHaveClass(standalone, {
      exact: true,
    });
  });

  it('renders name and metadata rows around the bubble', () => {
    render(
      <ChatMessage sender="user">
        <ChatMessageBubble
          metadata={<span data-testid="metadata" />}
          name="Cindy">
          Hi
        </ChatMessageBubble>
      </ChatMessage>,
    );

    expect(screen.getByText('Cindy')).toHaveAttribute('data-chat-name');
    expect(screen.getByTestId('metadata')).toBeInTheDocument();
  });

  it('applies className, style, and ref to the bubble element', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ChatMessageBubble
        className="custom-bubble"
        data-testid="bubble"
        ref={ref}
        style={{color: 'red'}}>
        Hi
      </ChatMessageBubble>,
    );

    const bubble = screen.getByTestId('bubble');
    expect(bubble).toHaveClass('custom-bubble');
    expect(bubble).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});

describe('ChatMessageMetadata', () => {
  it('renders nothing when empty', () => {
    const {container} = render(<ChatMessageMetadata />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders timestamp, footer, and status separated by dots', () => {
    render(
      <ChatMessageMetadata
        data-testid="metadata"
        footer={<span>gpt-4o</span>}
        status="read"
        timestamp="2:30 PM"
      />,
    );

    const metadata = screen.getByTestId('metadata');
    expect(metadata).toHaveTextContent('2:30 PM');
    expect(metadata).toHaveTextContent('gpt-4o');
    expect(metadata).toHaveTextContent('Read');
    expect(metadata.textContent.match(/·/g)).toHaveLength(2);
  });

  it.each([
    ['sending', 'Message sending'],
    ['sent', 'Message sent'],
    ['delivered', 'Message delivered'],
    ['read', 'Message read'],
    ['error', 'Message failed'],
  ] as const)('labels the %s status', (status, label) => {
    render(<ChatMessageMetadata status={status} />);

    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it('reverses direction for user messages', () => {
    render(
      <ChatMessage sender="user">
        <ChatMessageMetadata data-testid="user-metadata" timestamp="1:00" />
      </ChatMessage>,
    );
    render(<ChatMessageMetadata data-testid="metadata" timestamp="1:00" />);

    expect(screen.getByTestId('user-metadata')).not.toHaveClass(
      screen.getByTestId('metadata').className,
      {exact: true},
    );
  });
});

describe('ChatSystemMessage', () => {
  it('renders a status element with centered content', () => {
    render(<ChatSystemMessage>Conversation started</ChatSystemMessage>);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Conversation started',
    );
  });

  it('renders an icon before the text', () => {
    render(
      <ChatSystemMessage icon={<span data-testid="icon" />}>
        User joined
      </ChatSystemMessage>,
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders the divider variant as a labeled separator', () => {
    render(<ChatSystemMessage variant="divider">Today</ChatSystemMessage>);

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('separator', {name: 'Today'})).toBeInTheDocument();
  });

  it('carries the chat-message marker in both variants', () => {
    render(<ChatSystemMessage data-testid="notice">Started</ChatSystemMessage>);
    render(
      <ChatSystemMessage data-testid="divider-notice" variant="divider">
        Today
      </ChatSystemMessage>,
    );

    expect(screen.getByTestId('notice')).toHaveAttribute('data-chat-message');
    expect(screen.getByTestId('notice')).toHaveAttribute(
      'data-sender',
      'system',
    );
    expect(screen.getByTestId('divider-notice')).toHaveAttribute(
      'data-chat-message',
    );
  });

  it('applies className, style, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ChatSystemMessage
        className="custom-system"
        data-testid="system"
        ref={ref}
        style={{color: 'red'}}>
        Notice
      </ChatSystemMessage>,
    );

    const message = screen.getByTestId('system');
    expect(message).toHaveClass('custom-system');
    expect(message).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });
});
