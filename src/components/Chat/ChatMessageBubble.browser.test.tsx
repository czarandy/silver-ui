import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import type {ChatDensity} from 'components/Chat/ChatContext';
import {ChatMessage} from 'components/Chat/ChatMessage';
import {ChatMessageBubble} from 'components/Chat/ChatMessageBubble';

// Real-layout tests for the name row. jsdom has no layout, so it cannot show
// where the name's glyphs sit relative to the bubble.

function textBox(element: HTMLElement): DOMRect {
  const range = document.createRange();
  range.selectNodeContents(element);
  return range.getBoundingClientRect();
}

describe('ChatMessageBubble name row', () => {
  it.each<ChatDensity>(['compact', 'balanced', 'spacious'])(
    'keeps descenders in the name clear of the bubble at %s density',
    density => {
      render(
        <ChatMessage density={density} sender="assistant">
          <ChatMessageBubble data-testid="bubble" name="Andrey">
            Looking now
          </ChatMessageBubble>
        </ChatMessage>,
      );

      const name = textBox(screen.getByText('Andrey'));
      const bubble = screen.getByTestId('bubble').getBoundingClientRect();
      expect(bubble.top - name.bottom).toBeGreaterThanOrEqual(2);
    },
  );

  it('aligns the name with the bubble text', () => {
    render(
      <ChatMessage sender="assistant">
        <ChatMessageBubble name="Andrey">
          <span>Looking now</span>
        </ChatMessageBubble>
      </ChatMessage>,
    );

    expect(textBox(screen.getByText('Andrey')).left).toBeCloseTo(
      textBox(screen.getByText('Looking now')).left,
      0,
    );
  });
});
