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

export interface SegmentedControlProps {
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
  onChange: (value: string) => void;
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
  value: string;
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5',
    p: '0.5',
    bg: 'silver-neutral.100',
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
  size: {
    sm: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
    md: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
    lg: css({'--segmented-control-radius': 'var(--silver-radii-md)'}),
  },
} as const;

export function SegmentedControl({
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
}: SegmentedControlProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const contextValue = useMemo(
    () => ({isDisabled, layout, onChange, size, value}),
    [isDisabled, layout, onChange, size, value],
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
        onChange(nextValue);
      }
    },
    [isDisabled, onChange],
  );

  return (
    <SegmentedControlContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        className={cx(
          styles.root,
          styles.size[size],
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
