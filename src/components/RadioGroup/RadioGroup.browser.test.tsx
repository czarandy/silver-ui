import {act, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {
  RadioGroup,
  type RadioGroupProps,
} from 'components/RadioGroup/RadioGroup';
import {RadioGroupItem} from 'components/RadioGroup/RadioGroupItem';

function Example(
  props: Pick<
    RadioGroupProps,
    'value' | 'onChange' | 'label' | 'size' | 'isDisabled' | 'isReadOnly'
  >,
): React.JSX.Element {
  const [value, setValue] = useState(props.value);
  return (
    <RadioGroup
      {...props}
      onChange={next => {
        setValue(next);
        props.onChange(next);
      }}
      value={value}>
      <RadioGroupItem label="First" value="first" />
      <RadioGroupItem label="Second" value="second" />
    </RadioGroup>
  );
}

const sizes = ['sm', 'md', 'lg'] as const;

// Native pointer events at the visible circle's edges catch WebKit's intrinsic
// radio size; jsdom and clicks targeted directly at the input do not.
describe('RadioGroup hit area', () => {
  it.each(sizes)('covers the entire %s radio control', async size => {
    const onChange = vi.fn();
    render(<Example label="Choice" onChange={onChange} size={size} value="" />);
    const inputs = screen.getAllByRole<HTMLInputElement>('radio');
    for (const input of inputs) {
      // eslint-disable-next-line testing-library/no-node-access -- measure the visible circle
      const wrapper = input.parentElement!;
      const box = wrapper.getBoundingClientRect();
      const hitArea = input.getBoundingClientRect();
      expect(hitArea.width).toBe(box.width);
      expect(hitArea.height).toBe(box.height);
      expect(hitArea.left).toBe(box.left);
      expect(hitArea.top).toBe(box.top);
    }

    // Alternate between options at every position so each click must select
    // an unchecked radio, including after the selection dot has been rendered.
    for (const xFraction of [0, 0.5, 1]) {
      for (const yFraction of [0, 0.5, 1]) {
        for (const input of inputs) {
          // eslint-disable-next-line testing-library/no-node-access -- measure the visible circle
          const wrapper = input.parentElement!;
          const box = wrapper.getBoundingClientRect();
          const position = {
            x: 1 + xFraction * (box.width - 2),
            y: 1 + yFraction * (box.height - 2),
          };
          expect(
            document.elementFromPoint(
              box.left + position.x,
              box.top + position.y,
            ),
          ).toBe(input);
          await userEvent.hover(wrapper, {position, force: true});
          expect(getComputedStyle(input).cursor).toBe('pointer');
          // eslint-disable-next-line testing-library/no-unnecessary-act -- native browser events do not wrap React updates
          await act(async () => {
            await userEvent.click(wrapper, {position, force: true});
          });
          await expect.element(input).toBeChecked();
          expect(onChange).toHaveBeenLastCalledWith(input.value);
        }
      }
    }
    expect(onChange).toHaveBeenCalledTimes(18);
  });

  it.each(sizes)(
    'keeps a %s radio disabled or read-only at its edges',
    async size => {
      for (const state of ['isDisabled', 'isReadOnly'] as const) {
        const onChange = vi.fn();
        const {unmount} = render(
          <Example
            {...{[state]: true}}
            label="Choice"
            onChange={onChange}
            size={size}
            value="first"
          />,
        );
        const input = screen.getByRole<HTMLInputElement>('radio', {
          name: 'Second',
        });
        // eslint-disable-next-line testing-library/no-node-access -- measure the visible circle
        const wrapper = input.parentElement!;
        const box = wrapper.getBoundingClientRect();
        for (const position of [
          {x: 1, y: 1},
          {x: box.width - 1, y: box.height - 1},
        ]) {
          await userEvent.click(wrapper, {position, force: true});
          expect(input).not.toBeChecked();
          expect(screen.getByRole('radio', {name: 'First'})).toBeChecked();
          expect(onChange).not.toHaveBeenCalled();
        }
        unmount();
      }
    },
  );

  it('keeps keyboard focus, Space activation, and arrow navigation', async () => {
    const onChange = vi.fn();
    render(<Example label="Choice" onChange={onChange} value="" />);
    const first = screen.getByRole('radio', {name: 'First'});
    // Safari's Tab order depends on the macOS keyboard navigation preference.
    act(() => first.focus());
    expect(first.tabIndex).toBe(0);
    expect(first).toHaveFocus();
    // eslint-disable-next-line testing-library/no-unnecessary-act -- native browser events do not wrap React updates
    await act(async () => {
      await userEvent.keyboard(' ');
    });
    await expect.element(first).toBeChecked();
    // eslint-disable-next-line testing-library/no-node-access -- the wrapper displays the focus ring
    expect(getComputedStyle(first.parentElement!).outlineStyle).toBe('solid');
    expect(onChange).toHaveBeenLastCalledWith('first');
    // eslint-disable-next-line testing-library/no-unnecessary-act -- native browser events do not wrap React updates
    await act(async () => {
      await userEvent.keyboard('{ArrowRight}');
    });
    await expect
      .element(screen.getByRole('radio', {name: 'Second'}))
      .toBeChecked();
    expect(onChange).toHaveBeenLastCalledWith('second');
  });
});
