'use client';

import {createContext, use, type RefObject} from 'react';

/**
 * Density presets shared by the chat components. Controls gaps, padding, and
 * the width of the message column.
 */
export type ChatDensity = 'compact' | 'balanced' | 'spacious';

/**
 * Who authored a chat message. Drives alignment and styling: `user` messages
 * align to the end, `assistant` messages to the start, and `system` messages
 * are centered.
 */
export type ChatMessageSender = 'assistant' | 'system' | 'user';

/**
 * Provided by ChatLayout so descendants can coordinate scrolling and sizing.
 */
export interface ChatLayoutContextValue {
  /**
   * Callback ref that ChatMessageList registers its content element with, so
   * the layout can observe content growth for auto-scroll and new-message
   * detection.
   */
  contentRef: (element: HTMLElement | null) => void;
  /**
   * Density derived from the layout width.
   */
  density: ChatDensity;
  /**
   * The scrolling element that contains the messages.
   */
  scrollContainerRef: RefObject<HTMLElement | null>;
}

export const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(
  null,
);
ChatLayoutContext.displayName = 'ChatLayoutContext';

export function useChatLayoutContext(): ChatLayoutContextValue | null {
  return use(ChatLayoutContext);
}

/**
 * Provided by ChatMessageList so messages inherit its density.
 */
export interface ChatListContextValue {
  density: ChatDensity;
}

export const ChatListContext = createContext<ChatListContextValue | null>(null);
ChatListContext.displayName = 'ChatListContext';

export function useChatListContext(): ChatListContextValue | null {
  return use(ChatListContext);
}

/**
 * Provided by ChatMessage so bubbles and metadata style themselves by sender
 * without extra props.
 */
export interface ChatMessageContextValue {
  density: ChatDensity;
  sender: ChatMessageSender;
}

export const ChatMessageContext = createContext<ChatMessageContextValue | null>(
  null,
);
ChatMessageContext.displayName = 'ChatMessageContext';

export function useChatMessageContext(): ChatMessageContextValue | null {
  return use(ChatMessageContext);
}

/**
 * Provided by ChatComposer so the default input and send button work without
 * wiring, while still being overridable via their own props.
 */
export interface ChatComposerContextValue {
  /**
   * Whether the current value can be submitted (non-empty and not disabled).
   */
  canSend: boolean;
  isDisabled: boolean;
  isStopShown: boolean;
  onChange: (value: string) => void;
  onStop?: () => void;
  /**
   * Submits the composer's current value.
   */
  onSubmit: () => void;
  placeholder: string;
  value: string;
}

export const ChatComposerContext =
  createContext<ChatComposerContextValue | null>(null);
ChatComposerContext.displayName = 'ChatComposerContext';

export function useChatComposerContext(): ChatComposerContextValue | null {
  return use(ChatComposerContext);
}
