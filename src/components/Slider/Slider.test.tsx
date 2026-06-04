import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {afterAll, beforeAll, describe, expect, it, vi} from 'vitest';
import {getNecessity} from '../Field';
import {Slider, type SliderRangeProps, type SliderSingleProps} from './Slider';

const popoverOpenState = new WeakMap<HTMLElement, boolean>();

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = () =>
    Object.assign(new DOMRect(0, 0, 200, 20), rect);
}

describe('Slider', () => {
  const noop = () => {};

  beforeAll(() => {
    HTMLElement.prototype.showPopover = function (this: HTMLElement) {
      popoverOpenState.set(this, true);
    };
    HTMLElement.prototype.hidePopover = function (this: HTMLElement) {
      popoverOpenState.set(this, false);
    };
  });

  afterAll(() => {
    Reflect.deleteProperty(HTMLElement.prototype, 'showPopover');
    Reflect.deleteProperty(HTMLElement.prototype, 'hidePopover');
  });

  function ControlledSingleSlider({
    onChange,
    value: initialValue,
    isOptional,
    isRequired,
    ...props
  }: Omit<SliderSingleProps, 'onChange' | 'value'> & {
    onChange?: (value: number) => void;
    value: number;
  }): React.JSX.Element {
    const [value, setValue] = useState<number>(initialValue);

    return (
      <Slider
        {...props}
        {...getNecessity(isOptional, isRequired)}
        onChange={(nextValue: number) => {
          setValue(nextValue);
          onChange?.(nextValue);
        }}
        value={value}
      />
    );
  }

  function ControlledRangeSlider({
    onChange,
    value: initialValue,
    isOptional,
    isRequired,
    ...props
  }: Omit<SliderRangeProps, 'onChange' | 'value'> & {
    onChange?: (value: [number, number]) => void;
    value: [number, number];
  }): React.JSX.Element {
    const [value, setValue] = useState<[number, number]>(initialValue);

    return (
      <Slider
        {...props}
        {...getNecessity(isOptional, isRequired)}
        onChange={(nextValue: [number, number]) => {
          setValue(nextValue);
          onChange?.(nextValue);
        }}
        value={value}
      />
    );
  }

  it('renders a labelled single-value slider', () => {
    render(<Slider label="Volume" onChange={noop} value={50} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Volume');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders labelled range thumbs', () => {
    render(<Slider label="Price range" onChange={() => {}} value={[20, 80]} />);

    const sliders = screen.getAllByRole('slider');
    expect(sliders[0]).toHaveAttribute(
      'aria-label',
      'Price range, minimum value',
    );
    expect(sliders[1]).toHaveAttribute(
      'aria-label',
      'Price range, maximum value',
    );
  });

  it('associates the label with the first thumb in range mode', () => {
    render(<Slider label="Price range" onChange={() => {}} value={[20, 80]} />);

    const sliders = screen.getAllByRole('slider');
    const thumbId = sliders[0].getAttribute('id');
    expect(thumbId).toBeTruthy();
    // eslint-disable-next-line testing-library/no-node-access
    expect(screen.getByText('Price range').closest('label')).toHaveAttribute(
      'for',
      thumbId,
    );
  });

  it('links description to the thumb via aria-describedby', () => {
    render(
      <Slider
        description="Adjust the volume level"
        label="Volume"
        onChange={noop}
        value={50}
      />,
    );

    const slider = screen.getByRole('slider');
    const describedBy = slider.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const descriptionId = describedBy?.split(' ')[0] ?? '';
    expect(screen.getByText('Adjust the volume level')).toHaveAttribute(
      'id',
      expect.stringContaining(descriptionId),
    );
  });

  it('supports formatted aria value text and visible value text', () => {
    render(
      <Slider
        formatValue={value => `${value}F`}
        label="Temperature"
        onChange={noop}
        value={72}
        valueDisplay="text"
      />,
    );

    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '72F');
    expect(screen.getByText('72F')).toBeInTheDocument();
  });

  it('sets vertical orientation and status attributes', () => {
    render(
      <Slider
        label="Volume"
        onChange={noop}
        orientation="vertical"
        status={{message: 'Too loud', type: 'error'}}
        value={50}
      />,
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-orientation', 'vertical');
    expect(slider).toHaveAttribute('aria-invalid', 'true');
    expect(slider).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('status') as string,
    );
  });

  it('does not fire changes when disabled', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Slider isDisabled label="Volume" onChange={onChange} value={50} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-disabled', 'true');
    expect(slider).toHaveAttribute('tabIndex', '-1');

    fireEvent.pointerDown(screen.getByTestId('slider-track-container'), {
      clientX: 100,
      clientY: 10,
    });
    await user.keyboard('{ArrowRight}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('handles keyboard changes and commits onChangeEnd', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        step={5}
        value={50}
      />,
    );

    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith(55);
    expect(onChangeEnd).toHaveBeenCalledWith(55);
  });

  it('handles Home, End, PageUp, and PageDown keyboard shortcuts', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <ControlledSingleSlider
        label="Volume"
        onChange={onChange}
        step={5}
        value={50}
      />,
    );

    const slider = screen.getByRole('slider');
    act(() => {
      slider.focus();
    });

    await user.keyboard('{Home}');
    await user.keyboard('{End}');
    await user.keyboard('{PageDown}');
    await user.keyboard('{PageUp}');

    expect(onChange).toHaveBeenNthCalledWith(1, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, 100);
    expect(onChange).toHaveBeenNthCalledWith(3, 50);
    expect(onChange).toHaveBeenNthCalledWith(4, 100);
  });

  it('enforces range thumb spacing', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(
      <Slider
        label="Range"
        max={100}
        min={0}
        minStepsBetweenThumbs={2}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        step={5}
        value={[20, 30]}
      />,
    );

    const lowerThumb = screen.getAllByRole('slider')[0];
    act(() => {
      lowerThumb.focus();
    });
    await user.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenCalledWith([20, 30]);
    expect(onChangeEnd).toHaveBeenCalledWith([20, 30]);
  });

  it('updates from pointer interaction and commits on pointer up', () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(
      <Slider
        label="Volume"
        max={100}
        min={0}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
        value={50}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 100, clientY: 10, pointerId: 1});
    fireEvent.pointerUp(track, {clientX: 100, clientY: 10, pointerId: 1});

    expect(onChange).toHaveBeenCalledWith(50);
    expect(onChangeEnd).toHaveBeenCalledWith(50);
  });

  it('updates while dragging with pointerMove', () => {
    const onChange = vi.fn();
    render(
      <ControlledSingleSlider
        label="Volume"
        max={100}
        min={0}
        onChange={onChange}
        value={20}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 40, clientY: 10, pointerId: 1});
    fireEvent.pointerMove(track, {clientX: 150, clientY: 10, pointerId: 1});

    expect(onChange).toHaveBeenNthCalledWith(1, 20);
    expect(onChange).toHaveBeenNthCalledWith(2, 75);
  });

  it('does not move focus to the thumb during pointer interaction', () => {
    render(
      <Slider label="Volume" onChange={noop} value={50} valueDisplay="none" />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 100, clientY: 10, pointerId: 1});

    expect(screen.getByRole('slider')).not.toHaveFocus();
  });

  it('updates from vertical pointer interaction using inverted y-axis math', () => {
    const onChange = vi.fn();
    render(
      <ControlledSingleSlider
        label="Level"
        max={100}
        min={0}
        onChange={onChange}
        orientation="vertical"
        value={50}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {height: 200, width: 20});

    fireEvent.pointerDown(track, {clientX: 10, clientY: 150, pointerId: 1});
    fireEvent.pointerMove(track, {clientX: 10, clientY: 50, pointerId: 1});

    expect(onChange).toHaveBeenNthCalledWith(1, 25);
    expect(onChange).toHaveBeenNthCalledWith(2, 75);
  });

  it('updates the closest range thumb from pointer interaction', () => {
    const onChange = vi.fn();
    render(
      <ControlledRangeSlider
        label="Range"
        max={100}
        min={0}
        onChange={onChange}
        value={[20, 80]}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 140, clientY: 10, pointerId: 1});
    fireEvent.pointerMove(track, {clientX: 120, clientY: 10, pointerId: 1});

    expect(onChange).toHaveBeenNthCalledWith(1, [20, 70]);
    expect(onChange).toHaveBeenNthCalledWith(2, [20, 60]);
  });

  it('shows tooltip content while dragging', () => {
    render(
      <Slider
        formatValue={value => `${value}%`}
        label="Volume"
        onChange={noop}
        value={50}
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 100, clientY: 10, pointerId: 1});

    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      '50%',
    );
  });

  it('commits the pending value on pointer cancel', () => {
    const onChangeEnd = vi.fn();
    render(
      <ControlledSingleSlider
        label="Volume"
        max={100}
        min={0}
        onChangeEnd={onChangeEnd}
        value={20}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 40, clientY: 10, pointerId: 1});
    fireEvent.pointerMove(track, {clientX: 160, clientY: 10, pointerId: 1});
    fireEvent.pointerCancel(track, {clientX: 160, clientY: 10, pointerId: 1});

    expect(onChangeEnd).toHaveBeenCalledWith(80);
  });

  it('clamps pointer values outside the track bounds', () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Volume"
        max={100}
        min={0}
        onChange={onChange}
        value={50}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: -100, clientY: 10, pointerId: 1});
    fireEvent.pointerUp(track, {clientX: -100, clientY: 10, pointerId: 1});
    fireEvent.pointerDown(track, {clientX: 300, clientY: 10, pointerId: 2});

    expect(onChange).toHaveBeenNthCalledWith(1, 0);
    expect(onChange).toHaveBeenNthCalledWith(2, 100);
  });

  it('uses raw pointer values when step is zero', () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Volume"
        max={100}
        min={0}
        onChange={onChange}
        step={0}
        value={50}
        valueDisplay="none"
      />,
    );

    const track = screen.getByTestId('slider-track-container');
    mockRect(track, {width: 200});

    fireEvent.pointerDown(track, {clientX: 67, clientY: 10, pointerId: 1});

    expect(onChange).toHaveBeenCalledWith(33.5);
  });

  it('snaps to clicked marks', () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Volume"
        marks={[{label: '100', value: 100}]}
        onChange={onChange}
        value={50}
        valueDisplay="none"
      />,
    );

    fireEvent.pointerDown(screen.getByTestId('slider-mark-label'), {
      clientX: 1,
      clientY: 10,
      pointerId: 1,
    });

    expect(onChange).toHaveBeenCalledWith(100);
  });
});
