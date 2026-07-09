'use client';

import {
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {segmentedControlRecipe} from 'components/SegmentedControl/SegmentedControl.recipe';
import {
  SegmentedControlContext,
  type SegmentedControlLayout,
  type SegmentedControlSize,
} from 'components/SegmentedControl/SegmentedControlContext';
import useListFocus from 'hooks/useListFocus';
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
   * Current selected value.
   */
  value: TValue;
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
  isDisabled = false,
  label,
  layout = 'hug',
  onChange,
  ref,
  size = 'md',
  style,
  value,
}: SegmentedControlProps<TValue>): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleChange = useCallback(
    (nextValue: string) => {
      onChange(nextValue as TValue);
    },
    [onChange],
  );
  const contextValue = useMemo(
    () => ({isDisabled, layout, onChange: handleChange, size, value}),
    [handleChange, isDisabled, layout, size, value],
  );
  const classes = segmentedControlRecipe({isDisabled, layout, size});

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }
      handleListKeyDown(event);
    },
    [handleListKeyDown, isDisabled],
  );

  return (
    <SegmentedControlContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        aria-orientation="horizontal"
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        onKeyDown={handleKeyDown}
        ref={mergeRefs(ref, containerRef)}
        role="radiogroup"
        style={style}
        tabIndex={-1}>
        {children}
      </div>
    </SegmentedControlContext>
  );
}

SegmentedControl.displayName = 'SegmentedControl';
