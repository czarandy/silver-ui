import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {
  useSelectListbox,
  type UseSelectListboxOptions,
} from 'internal/useSelectListbox';

type Option = {value: string};

function createOptions(
  overrides: Partial<UseSelectListboxOptions<Option>> = {},
): UseSelectListboxOptions<Option> {
  return {
    description: null,
    isOpen: false,
    onClose: () => {},
    onCommitOption: () => {},
    onOpen: () => {},
    options: ['Apple', 'Banana'],
    selectedValues: new Set(),
    status: undefined,
    ...overrides,
  };
}

async function nextAnimationFrame(): Promise<void> {
  await act(async () => {
    await new Promise(resolve => {
      requestAnimationFrame(() => resolve(undefined));
    });
  });
}

describe('useSelectListbox', () => {
  it('delegates trigger toggles to the controlled layer', () => {
    const onClose = vi.fn();
    const onOpen = vi.fn();
    const {result, rerender} = renderHook(
      ({isOpen}: {isOpen: boolean}) =>
        useSelectListbox(createOptions({isOpen, onClose, onOpen})),
      {initialProps: {isOpen: false}},
    );

    act(() => result.current.handleTriggerClick());
    expect(onOpen).toHaveBeenCalledOnce();
    expect(onClose).not.toHaveBeenCalled();

    rerender({isOpen: true});
    act(() => result.current.handleTriggerClick());
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('routes close-on-commit through the controlled layer', () => {
    const onClose = vi.fn();
    const onCommitOption = vi.fn(() => true);
    function Fixture(): React.JSX.Element {
      const {handleOptionClick} = useSelectListbox(
        createOptions({
          isListboxClosedOnCommit: true,
          isOpen: true,
          onClose,
          onCommitOption,
        }),
      );
      return (
        <button data-value="Apple" onClick={handleOptionClick} type="button">
          Apple
        </button>
      );
    }

    render(<Fixture />);
    fireEvent.click(screen.getByRole('button', {name: 'Apple'}));

    expect(onCommitOption).toHaveBeenCalledWith({
      label: 'Apple',
      value: 'Apple',
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('suppresses focus-to-open after a browser-driven close until blur', async () => {
    const onOpen = vi.fn();
    const {result, rerender} = renderHook(
      ({isOpen}: {isOpen: boolean}) =>
        useSelectListbox(
          createOptions({hasEntriesOnFocus: true, isOpen, onOpen}),
        ),
      {initialProps: {isOpen: true}},
    );

    rerender({isOpen: false});
    act(() => result.current.handleTriggerFocus());
    expect(onOpen).not.toHaveBeenCalled();

    act(() => result.current.handleTriggerBlur());
    await nextAnimationFrame();
    act(() => result.current.handleTriggerFocus());
    expect(onOpen).toHaveBeenCalledOnce();
  });
});
