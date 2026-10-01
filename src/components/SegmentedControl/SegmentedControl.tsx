'use client';

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from 'react';
import {useFieldset} from 'components/Fieldset';
import {segmentedControlRecipe} from 'components/SegmentedControl/SegmentedControl.recipe';
import {
  SegmentedControlContext,
  type SegmentedControlLayout,
  type SegmentedControlSize,
} from 'components/SegmentedControl/SegmentedControlContext';
import {
  SegmentedControlItem,
  type SegmentedControlItemProps,
} from 'components/SegmentedControl/SegmentedControlItem';
import useKeyboardHint from 'hooks/useKeyboardHint';
import useListFocus from 'hooks/useListFocus';
import {useResolvedSize} from 'internal/SizeContext';
import {mergeRefs} from 'internal/mergeRefs';
import {cx} from 'utils/cx';

export interface SegmentedControlProps<TValue extends string = string> {
  /**
   * SegmentedControlItem children.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Whether the entire control is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the selected segment is displayed without allowing interaction.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Accessible label for the radio group.
   */
  label: string;
  /**
   * Segment layout mode.
   * @default 'hug'
   */
  layout?: SegmentedControlLayout;
  /**
   * Called when a segment is selected.
   */
  onChange: (value: TValue) => void;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Control size.
   * @default 'md'
   */
  size?: SegmentedControlSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
  /**
   * Current selected value, or `undefined` when no segment is selected.
   */
  value?: TValue;
}

function getEnabledItemValues(children: ReactNode): string[] {
  // eslint-disable-next-line @eslint-react/no-children-to-array -- the control owns its SegmentedControlItem children and needs their render order for the roving tab stop
  return Children.toArray(children)
    .filter(
      (child): child is ReactElement<SegmentedControlItemProps<string>> =>
        isValidElement<SegmentedControlItemProps<string>>(child) &&
        child.type === SegmentedControlItem,
    )
    .filter(child => child.props.isDisabled !== true)
    .map(child => child.props.value);
}

/**
 * Segmented toggle control for selecting one option from a small set.
 *
 * Rendered as a radio group (`role="radiogroup"`), so reach for it when picking
 * a value — filters, settings, or view modes whose content you render yourself.
 * If selecting an option should show or hide associated content panels, use
 * {@link Tabs} instead.
 */
export function SegmentedControl<TValue extends string = string>({
  children,
  className,
  'data-testid': dataTestId,
  isDisabled: isDisabledFromProps = false,
  isReadOnly: isReadOnlyFromProps = false,
  label,
  layout = 'hug',
  onChange,
  ref,
  size: sizeProp,
  style,
  value,
}: SegmentedControlProps<TValue>): React.JSX.Element {
  const size = useResolvedSize(sizeProp);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldset = useFieldset();
  const isDisabled = isDisabledFromProps || fieldset?.isDisabled === true;
  const isReadOnly =
    !isDisabled && (isReadOnlyFromProps || fieldset?.isReadOnly === true);
  const handleChange = useCallback(
    (nextValue: string) => {
      if (!isReadOnly) {
        onChange(nextValue as TValue);
      }
    },
    [isReadOnly, onChange],
  );
  const tabStopValue = useMemo(() => {
    if (isDisabled || isReadOnly) {
      return undefined;
    }

    const enabledItemValues = getEnabledItemValues(children);
    return (
      enabledItemValues.find(itemValue => itemValue === value) ??
      enabledItemValues[0]
    );
  }, [children, isDisabled, isReadOnly, value]);
  const contextValue = useMemo(
    () => ({
      isDisabled,
      isReadOnly,
      layout,
      onChange: handleChange,
      size,
      tabStopValue,
      value,
    }),
    [isDisabled, isReadOnly, handleChange, layout, size, tabStopValue, value],
  );
  const classes = segmentedControlRecipe({
    isDisabled,
    isReadOnly,
    layout,
    size,
  });

  const getItems = useCallback(
    () =>
      Array.from(
        containerRef.current?.querySelectorAll<HTMLElement>(
          '[role="radio"]:not([aria-disabled="true"])',
        ) ?? [],
      ),
    [],
  );
  const {handleKeyDown: handleListKeyDown} = useListFocus({
    getItems,
    // Selection follows focus, per the WAI-ARIA radio group pattern.
    onFocusItem: item => {
      const nextValue = item.dataset.value;
      if (nextValue != null) {
        handleChange(nextValue);
      }
    },
    // Laid out horizontally, but either axis navigates it.
    orientation: 'both',
  });

  // Only ← → are advertised even though either axis navigates: the control
  // reads as a horizontal row, and drawing all four arrows is noise for an
  // affordance the user only has to be shown once.
  const hint = useKeyboardHint({
    isEnabled: !isDisabled && !isReadOnly,
    orientation: 'horizontal',
  });

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Dismissing is safe even while disabled — the hint cannot be showing.
      hint.onKeyDown(event);
      if (isDisabled || isReadOnly) {
        return;
      }
      handleListKeyDown(event);
    },
    [isDisabled, isReadOnly, handleListKeyDown, hint],
  );

  useEffect(() => {
    if (isReadOnly) {
      getItems().forEach(item => item.blur());
    }
  }, [isReadOnly, getItems]);

  return (
    <SegmentedControlContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        aria-orientation="horizontal"
        aria-readonly={isReadOnly || undefined}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        onBlur={hint.onBlur}
        onFocus={hint.onFocus}
        onKeyDown={handleKeyDown}
        ref={mergeRefs(ref, containerRef)}
        role="radiogroup"
        style={style}
        tabIndex={-1}>
        {children}
        {hint.hintElement}
      </div>
    </SegmentedControlContext>
  );
}

SegmentedControl.displayName = 'SegmentedControl';
