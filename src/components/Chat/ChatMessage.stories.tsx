import type {Meta, StoryObj} from '@storybook/react-vite';
import {Sparkles} from 'lucide-react';
import {Avatar} from 'components/Avatar';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageBubble} from 'components/Chat/ChatMessageBubble';
import {ChatMessageMetadata} from 'components/Chat/ChatMessageMetadata';
import {ChatSystemMessage} from 'components/Chat/ChatSystemMessage';
import {Icon} from 'components/Icon';
import {Timestamp} from 'components/Timestamp';
import {css} from 'styled-system/css';

const meta: Meta<typeof ChatMessage> = {
  title: 'Components/Chat/Chat Message',
  component: ChatMessage,
  args: {
    sender: 'assistant',
  },
  argTypes: {
    sender: {
      control: {type: 'select'},
      options: ['assistant', 'user', 'system'],
    },
    density: {
      control: {type: 'select'},
      options: ['compact', 'balanced', 'spacious'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const columnStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '3',
  maxW: '640px',
});

export const Basic: Story = {
  render: args => (
    <ChatMessage {...args}>
      <ChatMessageBubble>Hi! How can I help you today?</ChatMessageBubble>
    </ChatMessage>
  ),
};

export const Senders: Story = {
  render: () => (
    <div className={columnStyle}>
      <ChatMessage sender="assistant">
        <ChatMessageBubble>I'm an assistant message.</ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="user">
        <ChatMessageBubble>I'm a user message.</ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="system">
        <ChatSystemMessage>Conversation started</ChatSystemMessage>
      </ChatMessage>
    </div>
  ),
};

export const BubbleVariants: Story = {
  render: () => (
    <div className={columnStyle}>
      <ChatMessage sender="assistant">
        <ChatMessageBubble>A filled bubble (default).</ChatMessageBubble>
      </ChatMessage>
      <ChatMessage sender="assistant">
        <ChatMessageBubble variant="ghost">
          A ghost bubble: no background, but the same alignment.
        </ChatMessageBubble>
      </ChatMessage>
    </div>
  ),
};

export const GroupedBubbles: Story = {
  render: () => (
    <div className={columnStyle}>
      <ChatMessage sender="user">
        <ChatMessageBubble group="first">
          Consecutive bubbles from one sender
        </ChatMessageBubble>
        <ChatMessageBubble group="middle">
          tighten their corners on the sender side
        </ChatMessageBubble>
        <ChatMessageBubble group="last">
          so they read as one run.
        </ChatMessageBubble>
      </ChatMessage>
    </div>
  ),
};

export const WithAvatarAndName: Story = {
  render: () => (
    <div className={columnStyle}>
      <ChatMessage
        avatar={<Avatar name="Navi" size="small" />}
        sender="assistant">
        <ChatMessageBubble
          metadata={
            <ChatMessageMetadata
              timestamp={
                <Timestamp format="time" value="2026-07-14T14:30:00Z" />
              }
            />
          }
          name="Navi">
          Hello! I looked into your question.
        </ChatMessageBubble>
      </ChatMessage>
      <ChatMessage avatar={<Avatar name="Cindy Park" />} sender="user">
        <ChatMessageBubble
          metadata={<ChatMessageMetadata status="read" timestamp="2:31 PM" />}
          name="Cindy">
          Thanks, that was fast!
        </ChatMessageBubble>
      </ChatMessage>
    </div>
  ),
};

export const MetadataStatuses: Story = {
  render: () => (
    <div className={columnStyle}>
      {(['sending', 'sent', 'delivered', 'read', 'error'] as const).map(
        status => (
          <ChatMessage key={status} sender="user">
            <ChatMessageBubble
              metadata={
                <ChatMessageMetadata status={status} timestamp="2:30 PM" />
              }>
              Message with {status} status
            </ChatMessageBubble>
          </ChatMessage>
        ),
      )}
    </div>
  ),
};

export const SystemMessages: Story = {
  render: () => (
    <div className={columnStyle}>
      <ChatSystemMessage>Conversation started</ChatSystemMessage>
      <ChatSystemMessage icon={<Icon icon={Sparkles} size="sm" />}>
        Model upgraded
      </ChatSystemMessage>
      <ChatSystemMessage variant="divider">Today</ChatSystemMessage>
    </div>
  ),
};
