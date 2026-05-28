import {act, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Slider} from './Slider';

function mockRect(element: Element, rect: Partial<DOMRect>): void {
  element.getBoundingClientRect = () =>
    Object.assign(new DOMRect(0, 0, 200, 20), rect);
}

describe('Slider', () => {
  it('renders a labelled single-value slider', () => {
    render(<Slider label="Volume" value={50} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAttribute('aria-label', 'Volume');
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '100');
    expect(slider).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders labelled range thumbs', () => {
    render(<Slider label="Price range" value={[20, 80]} />);

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

  it('supports formatted aria value text and visible value text', () => {
    render(
      <Slider
        formatValue={value => `${value}F`}
        label="Temperature"
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
