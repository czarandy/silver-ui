import {fireEvent, render} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {useEscapeDismiss} from 'internal/useEscapeDismiss';

function TestLayer({
  id,
  isEnabled = true,
  onEscape,
}: {
  id: string;
  isEnabled?: boolean;
  onEscape: () => void;
}) {
  useEscapeDismiss({id, isEnabled, onEscape});
  return null;
}

describe('useEscapeDismiss', () => {
  it('does not reorder a layer when an inline Escape handler changes', () => {
    const parentEscape = vi.fn();
    const childEscape = vi.fn();

    function Test({version}: {version: number}) {
      return (
        <>
          <TestLayer
            id="parent"
            onEscape={() => {
              parentEscape(version);
            }}
          />
          <TestLayer
            id="child"
            onEscape={() => {
              childEscape();
            }}
          />
        </>
      );
    }

    const {rerender} = render(<Test version={1} />);
    rerender(<Test version={2} />);

    fireEvent.keyDown(document, {key: 'Escape'});

    expect(parentEscape).not.toHaveBeenCalled();
    expect(childEscape).toHaveBeenCalledTimes(1);
  });

  it('unregisters when disabled', () => {
    const onEscape = vi.fn();
    const {rerender} = render(
      <TestLayer id="layer" isEnabled onEscape={onEscape} />,
    );

    rerender(<TestLayer id="layer" isEnabled={false} onEscape={onEscape} />);
    fireEvent.keyDown(document, {key: 'Escape'});

    expect(onEscape).not.toHaveBeenCalled();
  });
});
