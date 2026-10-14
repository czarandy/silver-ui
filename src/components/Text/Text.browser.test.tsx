import {act, render, screen} from '@testing-library/react';
import type {RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Heading} from 'components/Text/Heading';
import {Text} from 'components/Text/Text';

const firstText =
  'First long text that exceeds the available width and is truncated.';
const secondText =
  'Updated long text that also exceeds the same fixed width without resizing.';

async function flushMeasurements(): Promise<void> {
  // Truncation publishes React state from the browser's animation frame.
  await act(async () => {
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => resolve());
    });
  });
}

describe.each(['Text', 'Heading'] as const)(
  '%s truncation with stable refs',
  kind => {
    it('updates tooltip content and overflow without reattaching the consumer ref', async () => {
      const cleanup = vi.fn();
      const ref = vi.fn<RefCallback<HTMLElement>>(() => cleanup);
      function Example({children}: {children: string}): React.JSX.Element {
        return (
          <div style={{width: 160}}>
            {kind === 'Text' ? (
              <Text maxLines={1} ref={ref}>
                {children}
              </Text>
            ) : (
              <Heading level={3} maxLines={1} ref={ref}>
                {children}
              </Heading>
            )}
          </div>
        );
      }
      const {rerender, unmount} = render(<Example>{firstText}</Example>);
      const element = screen.getByText(firstText);
      const firstBox = element.getBoundingClientRect();

      await flushMeasurements();
      await expect
        .poll(() => screen.queryByRole('tooltip', {hidden: true})?.textContent)
        .toBe(firstText);
      expect(ref).toHaveBeenCalledExactlyOnceWith(element);
      rerender(<Example>{secondText}</Example>);
      await flushMeasurements();
      await expect
        .poll(() => screen.queryByRole('tooltip', {hidden: true})?.textContent)
        .toBe(secondText);
      expect(element.getBoundingClientRect().width).toBe(firstBox.width);
      expect(element.getBoundingClientRect().height).toBe(firstBox.height);
      expect(ref).toHaveBeenCalledExactlyOnceWith(element);
      expect(cleanup).not.toHaveBeenCalled();

      rerender(<Example>Short</Example>);
      await flushMeasurements();
      await expect
        .poll(() => screen.queryByRole('tooltip', {hidden: true}))
        .toBeNull();
      expect(screen.getByText('Short')).toBe(element);
      expect(ref).toHaveBeenCalledExactlyOnceWith(element);
      unmount();
      expect(cleanup).toHaveBeenCalledOnce();
      expect(ref).toHaveBeenCalledOnce();
    });
  },
);
