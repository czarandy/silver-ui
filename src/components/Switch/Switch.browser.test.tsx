import {act, render, screen} from '@testing-library/react';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {userEvent} from 'vitest/browser';
import {Switch, type SwitchProps} from 'components/Switch/Switch';

function Example(props: SwitchProps): React.JSX.Element {
  const [value, setValue] = useState(props.isSelected);
  return (
    <Switch
      {...props}
      isSelected={value}
      onChange={(checked, event) => {
        setValue(checked);
        props.onChange(checked, event);
      }}
    />
  );
}

const sizes = ['sm', 'md', 'lg'] as const;
const values = [false, true];
const cases = sizes.flatMap(size =>
  values.flatMap(isSelected =>
    [false, true].map(isLabelHidden => ({size, isSelected, isLabelHidden})),
  ),
);

// Use real pointer events at coordinates relative to the visible wrapper.
// Clicking the input directly (or using jsdom) misses Safari's smaller hit area.
describe('Switch hit area', () => {
  it.each(cases)(
    'covers the $size box with isSelected=$isSelected and isLabelHidden=$isLabelHidden',
    async props => {
      const onChange = vi.fn();
      render(<Example {...props} label="Accept" onChange={onChange} />);
      const input = screen.getByRole<HTMLInputElement>('switch', {
        name: 'Accept',
      });
      // The wrapper has no semantic role; it defines the displayed box's size.
      // eslint-disable-next-line testing-library/no-node-access
      const wrapper = input.parentElement!;
      const box = wrapper.getBoundingClientRect();
      const hitArea = input.getBoundingClientRect();
      expect(hitArea.width).toBe(box.width);
      expect(hitArea.height).toBe(box.height);
      expect(hitArea.left).toBe(box.left);
      expect(hitArea.top).toBe(box.top);

      let checked = props.isSelected === true;
      for (const x of [1, box.width / 2, box.width - 1]) {
        for (const y of [1, box.height / 2, box.height - 1]) {
          expect(document.elementFromPoint(box.left + x, box.top + y)).toBe(
            input,
          );
          await userEvent.hover(wrapper, {position: {x, y}, force: true});
          expect(getComputedStyle(input).cursor).toBe('pointer');
          // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native browser events do not wrap React updates in act
          await act(async () => {
            await userEvent.click(wrapper, {position: {x, y}, force: true});
          });
          checked = !checked;
          await expect.element(input).toHaveProperty('checked', checked);
          expect(onChange).toHaveBeenLastCalledWith(checked, expect.anything());
        }
      }
      expect(onChange).toHaveBeenCalledTimes(9);
    },
  );

  it.each(sizes)(
    'keeps a %s box disabled or read-only at its edges',
    async size => {
      for (const state of ['isDisabled', 'isReadOnly'] as const) {
        const onChange = vi.fn();
        const {unmount} = render(
          <Example
            {...{[state]: true}}
            isSelected={false}
            label="Accept"
            onChange={onChange}
            size={size}
          />,
        );
        const input = screen.getByRole<HTMLInputElement>('switch', {
          name: 'Accept',
        });
        // eslint-disable-next-line testing-library/no-node-access -- measure the visible box
        const wrapper = input.parentElement!;
        const box = wrapper.getBoundingClientRect();
        for (const position of [
          {x: 1, y: 1},
          {x: box.width - 1, y: box.height - 1},
        ]) {
          expect(
            document.elementFromPoint(
              box.left + position.x,
              box.top + position.y,
            ) === input,
          ).toBe(state === 'isDisabled');
          await userEvent.click(wrapper, {position, force: true});
          expect(input).not.toBeChecked();
          expect(onChange).not.toHaveBeenCalled();
        }
        unmount();
      }
    },
  );

  it('keeps keyboard focus and Space activation', async () => {
    const onChange = vi.fn();
    render(<Example isSelected={false} label="Accept" onChange={onChange} />);
    const input = screen.getByRole('switch', {name: 'Accept'});
    // macOS Safari can skip checkboxes in the Tab order by system preference.
    // Focus explicitly, then use native keyboard events to verify activation.
    act(() => input.focus());
    expect(input.tabIndex).toBe(0);
    expect(input).toHaveFocus();
    // eslint-disable-next-line testing-library/no-node-access -- the decorative box displays the focus ring
    const box = input.parentElement!;
    // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native browser events do not wrap React updates in act
    await act(async () => {
      await userEvent.keyboard(' ');
    });
    expect(getComputedStyle(box).outlineStyle).toBe('solid');
    await expect.element(input).toBeChecked();
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });
});
