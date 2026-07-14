import type {Meta, StoryObj} from '@storybook/react-vite';
import {useEffect, useRef, useState} from 'react';
import {Avatar} from 'components/Avatar';
import {ChatComposer} from 'components/Chat/ChatComposer';
import {ChatLayout} from 'components/Chat/ChatLayout';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageBubble} from 'components/Chat/ChatMessageBubble';
import {ChatMessageList} from 'components/Chat/ChatMessageList';
import {ChatMessageMetadata} from 'components/Chat/ChatMessageMetadata';
import {ChatSystemMessage} from 'components/Chat/ChatSystemMessage';
import {EmptyState} from 'components/EmptyState';
import {css} from 'styled-system/css';

const meta: Meta<typeof ChatLayout> = {
  title: 'Components/Chat/Layout',
  component: ChatLayout,
};

export default meta;
type Story = StoryObj<typeof meta>;

const frameStyle = css({
  display: 'flex',
  flexDirection: 'column',
  h: '480px',
  maxW: '720px',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: 'xl',
  overflow: 'hidden',
  bg: 'bg',
});

interface DemoMessage {
  id: number;
  sender: 'assistant' | 'user';
  text: string;
}

const CONVERSATION: DemoMessage[] = [
  {id: 1, sender: 'user', text: 'Hey! Can you summarize the launch plan?'},
  {
    id: 2,
    sender: 'assistant',
    text: 'Of course. The launch has three phases: a private beta in August, an open beta in September, and general availability in October.',
  },
  {id: 3, sender: 'user', text: 'Who owns the open beta milestone?'},
  {
    id: 4,
    sender: 'assistant',
    text: 'The platform team owns it, with marketing handling the announcement. The exit criteria are 99.9% uptime over two weeks and fewer than five open P1 bugs.',
  },
];

function DemoConversation() {
  return (
    <ChatMessageList>
      <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
      {CONVERSATION.map(message => (
        <ChatMessage
          avatar={
            <Avatar
              name={message.sender === 'user' ? 'Cindy Park' : 'Navi'}
              size="small"
            />
          }
          key={message.id}
          sender={message.sender}>
          <ChatMessageBubble
            metadata={
              message.id === CONVERSATION.length ? (
                <ChatMessageMetadata status="read" timestamp="2:31 PM" />
              ) : undefined
            }>
            {message.text}
          </ChatMessageBubble>
        </ChatMessage>
      ))}
    </ChatMessageList>
  );
}

export const Basic: Story = {
  render: () => (
    <div className={frameStyle}>
      <ChatLayout composer={<ChatComposer onSubmit={() => {}} />}>
        <DemoConversation />
      </ChatLayout>
    </div>
  ),
};

const STREAM_TEXT =
  'Streaming responses keep the list pinned to the bottom while you stay ' +
  'scrolled down. Scroll up mid-stream and the auto-follow unlocks; a New ' +
  'messages pill appears when content arrives while you are reading above. ';

function StreamingPlaygroundDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    {id: 1, sender: 'user', text: 'Tell me how the auto-scroll works.'},
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const wordsRef = useRef<string[]>([]);
  const nextIdRef = useRef(2);

  useEffect(() => {
    if (!isStreaming) {
      return;
    }
    const interval = setInterval(() => {
      const word = wordsRef.current.shift();
      if (word == null) {
        setIsStreaming(false);
        return;
      }
      setMessages(current => {
        const last = current[current.length - 1];
        if (last.sender !== 'assistant') {
          return [
            ...current,
            {id: nextIdRef.current++, sender: 'assistant', text: word},
          ];
        }
        return [
          ...current.slice(0, -1),
          {...last, text: `${last.text} ${word}`},
        ];
      });
    }, 120);
    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className={frameStyle}>
      <ChatLayout
        composer={
          <ChatComposer
            isStopShown={isStreaming}
            onStop={() => setIsStreaming(false)}
            onSubmit={value => {
              setMessages(current => [
                ...current,
                {id: nextIdRef.current++, sender: 'user', text: value},
              ]);
              wordsRef.current = STREAM_TEXT.repeat(2).split(' ');
              setIsStreaming(true);
            }}
            placeholder="Send a message to start streaming…"
          />
        }>
        <ChatMessageList>
          {messages.map(message => (
            <ChatMessage key={message.id} sender={message.sender}>
              <ChatMessageBubble>{message.text}</ChatMessageBubble>
            </ChatMessage>
          ))}
        </ChatMessageList>
      </ChatLayout>
    </div>
  );
}

export const StreamingPlayground: Story = {
  render: () => <StreamingPlaygroundDemo />,
};

export const WithEmptyState: Story = {
  render: () => (
    <div className={frameStyle}>
      <ChatLayout
        composer={<ChatComposer onSubmit={() => {}} />}
        emptyState={
          <EmptyState
            description="Ask anything to get going."
            title="No messages yet"
          />
        }
      />
    </div>
  ),
};

export const Densities: Story = {
  render: () => (
    <div className={css({display: 'flex', flexDirection: 'column', gap: '6'})}>
      {[400, 700, 1000].map(width => (
        <div className={frameStyle} key={width} style={{maxWidth: width}}>
          <ChatLayout composer={<ChatComposer onSubmit={() => {}} />}>
            <DemoConversation />
          </ChatLayout>
        </div>
      ))}
    </div>
  ),
};

export const GroupedBubbles: Story = {
  render: () => (
    <div className={frameStyle}>
      <ChatLayout composer={<ChatComposer onSubmit={() => {}} />}>
        <ChatMessageList gap={1}>
          <ChatMessage avatar={<Avatar name="Navi" />} sender="assistant">
            <ChatMessageBubble group="first" name="Navi">
              Grouped bubbles share one avatar and name
            </ChatMessageBubble>
            <ChatMessageBubble group="middle">
              and tighten their sender-side corners
            </ChatMessageBubble>
            <ChatMessageBubble
              group="last"
              metadata={<ChatMessageMetadata timestamp="2:30 PM" />}>
              so a run of messages reads as one turn.
            </ChatMessageBubble>
          </ChatMessage>
          <ChatMessage avatar={<Avatar name="Cindy Park" />} sender="user">
            <ChatMessageBubble group="first">Nice.</ChatMessageBubble>
            <ChatMessageBubble group="last">Very tidy!</ChatMessageBubble>
          </ChatMessage>
        </ChatMessageList>
      </ChatLayout>
    </div>
  ),
};
