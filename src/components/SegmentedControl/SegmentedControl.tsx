import {
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {mergeRefs} from '../../internal/mergeRefs';
import {
  SegmentedControlContext,
  type SegmentedControlLayout,
  type SegmentedControlSize,
} from './SegmentedControlContext';

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

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5',
    p: '0.5',
    bg: 'surface.gray',
    borderRadius: 'md',
  }),
  fill: css({
    display: 'flex',
    w: 'full',
  }),
  disabled: css({
    opacity: 0.5,
    pointerEvents: 'none',
  }),
} as const;

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

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (isDisabled) {
        return;
      }

      const container = containerRef.current;
      if (container == null) {
        return;
      }

      const items = Array.from(
        container.querySelectorAll<HTMLButtonElement>(
          '[role="radio"]:not([aria-disabled="true"])',
        ),
      );

      if (items.length === 0) {
        return;
      }

      const currentIndex = items.findIndex(
        item => item === document.activeElement,
      );
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % items.length;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex =
            currentIndex === -1
              ? items.length - 1
              : (currentIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = items.length - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      const nextItem = items[nextIndex];
      nextItem.focus();
      const nextValue = nextItem.dataset.value;
      if (nextValue != null) {
        handleChange(nextValue);
      }
    },
    [handleChange, isDisabled],
  );

  return (
    <SegmentedControlContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        aria-orientation="horizontal"
        className={cx(
          styles.root,
          layout === 'fill' ? styles.fill : undefined,
          isDisabled ? styles.disabled : undefined,
          className,
        )}
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
