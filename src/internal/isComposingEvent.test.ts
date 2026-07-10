import {describe, expect, it} from 'vitest';
import {isComposingEvent} from 'internal/isComposingEvent';

describe('isComposingEvent', () => {
  it('detects native composing events', () => {
    expect(
      isComposingEvent(new KeyboardEvent('keydown', {isComposing: true})),
    ).toBe(true);
  });

  it('detects Safari processing key events', () => {
    const event = new KeyboardEvent('keydown');
    Object.defineProperty(event, 'keyCode', {value: 229});

    expect(isComposingEvent(event)).toBe(true);
  });

  it('detects React-shaped composing events', () => {
    expect(
      isComposingEvent({
        nativeEvent: new KeyboardEvent('keydown', {isComposing: true}),
      }),
    ).toBe(true);
  });

  it('returns false when the event is not composing', () => {
    expect(isComposingEvent(new KeyboardEvent('keydown'))).toBe(false);
  });
});
