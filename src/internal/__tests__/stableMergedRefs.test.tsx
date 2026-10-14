import {render, screen} from '@testing-library/react';
import {StrictMode, type RefCallback} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from 'components/CheckboxInput';
import {Dialog} from 'components/Dialog';
import {Heading, Text} from 'components/Text';
import {TextInput} from 'components/TextInput';
import {HoverLayerTrigger} from 'internal/HoverLayerTrigger';

describe('merged ref stability in components', () => {
  it('preserves React StrictMode cleanup while avoiding cleanup on ordinary rerenders', () => {
    const cleanup = vi.fn();
    const ref = vi.fn<RefCallback<HTMLElement>>(() => cleanup);
    const {rerender, unmount} = render(
      <StrictMode>
        <Text maxLines={1} ref={ref}>
          First text
        </Text>
      </StrictMode>,
    );
    const element = screen.getByText('First text');
    expect(ref).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();

    rerender(
      <StrictMode>
        <Text maxLines={1} ref={ref}>
          Updated text
        </Text>
      </StrictMode>,
    );
    expect(screen.getByText('Updated text')).toBe(element);
    expect(ref).toHaveBeenCalledTimes(2);
    expect(cleanup).toHaveBeenCalledOnce();
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(ref).toHaveBeenCalledTimes(2);
  });

  it.each([1, 2])(
    'keeps a truncated Text ref attached while text changes with maxLines=%i',
    maxLines => {
      const ref = vi.fn<RefCallback<HTMLElement>>();
      const {rerender, unmount} = render(
        <Text maxLines={maxLines} ref={ref}>
          First text
        </Text>,
      );
      const element = screen.getByText('First text');
      expect(ref).toHaveBeenCalledExactlyOnceWith(element);

      rerender(
        <Text maxLines={maxLines} ref={ref}>
          Updated text
        </Text>,
      );
      expect(screen.getByText('Updated text')).toBe(element);
      expect(ref).toHaveBeenCalledExactlyOnceWith(element);

      unmount();
      expect(ref).toHaveBeenNthCalledWith(2, null);
      expect(ref).toHaveBeenCalledTimes(2);
    },
  );

  it('keeps a Heading ref attached unless its actual heading element changes', () => {
    const cleanup = vi.fn();
    const ref = vi.fn<RefCallback<HTMLHeadingElement>>(() => cleanup);
    const {rerender, unmount} = render(
      <Heading level={2} maxLines={1} ref={ref}>
        First heading
      </Heading>,
    );
    const first = screen.getByRole('heading', {level: 2});

    rerender(
      <Heading level={2} maxLines={1} ref={ref}>
        Updated heading
      </Heading>,
    );
    expect(screen.getByRole('heading', {level: 2})).toBe(first);
    expect(ref).toHaveBeenCalledExactlyOnceWith(first);
    expect(cleanup).not.toHaveBeenCalled();

    rerender(
      <Heading accessibilityLevel={3} level={2} maxLines={1} ref={ref}>
        Updated heading
      </Heading>,
    );
    const replacement = screen.getByRole('heading', {level: 3});
    expect(replacement).not.toBe(first);
    expect(cleanup).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenNthCalledWith(2, replacement);
    unmount();
    expect(cleanup).toHaveBeenCalledTimes(2);
    expect(ref).toHaveBeenCalledTimes(2);
  });

  it('keeps input refs attached while controlled values change', () => {
    const textRef = vi.fn<RefCallback<HTMLInputElement>>();
    const checkboxRef = vi.fn<RefCallback<HTMLInputElement>>();
    const onChange = vi.fn();
    const {rerender, unmount} = render(
      <>
        <TextInput label="Name" onChange={onChange} ref={textRef} value="Ada" />
        <CheckboxInput
          label="Accept"
          onChange={onChange}
          ref={checkboxRef}
          value={false}
        />
      </>,
    );
    const textInput = screen.getByRole('textbox', {name: 'Name'});
    const checkbox = screen.getByRole('checkbox', {name: 'Accept'});

    rerender(
      <>
        <TextInput
          label="Name"
          onChange={onChange}
          ref={textRef}
          value="Grace"
        />
        <CheckboxInput
          label="Accept"
          onChange={onChange}
          ref={checkboxRef}
          value
        />
      </>,
    );
    expect(textInput).toHaveValue('Grace');
    expect(checkbox).toBeChecked();
    expect(textRef).toHaveBeenCalledExactlyOnceWith(textInput);
    expect(checkboxRef).toHaveBeenCalledExactlyOnceWith(checkbox);
    unmount();
    expect(textRef).toHaveBeenNthCalledWith(2, null);
    expect(checkboxRef).toHaveBeenNthCalledWith(2, null);
  });

  it('keeps a mounted dialog ref attached on content updates and cleans up on unmount', () => {
    const cleanup = vi.fn();
    const ref = vi.fn<RefCallback<HTMLDialogElement>>(() => cleanup);
    const onOpenChange = vi.fn();
    const {rerender, unmount} = render(
      <Dialog
        isOpen={false}
        label="Details"
        onOpenChange={onOpenChange}
        ref={ref}>
        First content
      </Dialog>,
    );
    const dialog = screen.getByRole('dialog', {hidden: true});

    rerender(
      <Dialog
        isOpen={false}
        label="Details"
        onOpenChange={onOpenChange}
        ref={ref}>
        Updated content
      </Dialog>,
    );
    expect(screen.getByRole('dialog', {hidden: true})).toBe(dialog);
    expect(ref).toHaveBeenCalledExactlyOnceWith(dialog);
    expect(cleanup).not.toHaveBeenCalled();
    unmount();
    expect(cleanup).toHaveBeenCalledOnce();
    expect(ref).toHaveBeenCalledOnce();
  });

  it('keeps hover trigger refs attached on text changes', () => {
    const triggerRef = vi.fn<RefCallback<HTMLElement>>();
    const wrapperRef = vi.fn<RefCallback<HTMLElement>>();
    const {rerender, unmount} = render(
      <HoverLayerTrigger
        describedBy="tooltip"
        layer={null}
        triggerRef={triggerRef}
        wrapperRef={wrapperRef}>
        First trigger
      </HoverLayerTrigger>,
    );
    const trigger = screen.getByText('First trigger');

    rerender(
      <HoverLayerTrigger
        describedBy="tooltip"
        layer={null}
        triggerRef={triggerRef}
        wrapperRef={wrapperRef}>
        Updated trigger
      </HoverLayerTrigger>,
    );
    expect(screen.getByText('Updated trigger')).toBe(trigger);
    expect(triggerRef).toHaveBeenCalledExactlyOnceWith(trigger);
    expect(wrapperRef).toHaveBeenCalledExactlyOnceWith(trigger);
    unmount();
    expect(triggerRef).toHaveBeenNthCalledWith(2, null);
    expect(wrapperRef).toHaveBeenNthCalledWith(2, null);
  });
});
