'use client';

import {
  createContext,
  use,
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import type {ButtonSize} from 'components/Button';
import {css} from 'styled-system/css';
import {cx} from 'utils/cx';

export type ToggleButtonGroupOrientation = 'horizontal' | 'vertical';

interface ToggleButtonGroupContextValue {
  isDisabled?: boolean;
  onToggle: (value: string) => void;
  selectedValues: Set<string>;
  size?: ButtonSize;
}

const ToggleButtonGroupContext =
  createContext<ToggleButtonGroupContextValue | null>(null);

ToggleButtonGroupContext.displayName = 'ToggleButtonGroupContext';

export function useToggleButtonGroup(): ToggleButtonGroupContextValue | null {
  return use(ToggleButtonGroupContext);
}

interface ToggleButtonGroupBaseProps {
  /**
   * Toggle button children.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the group root.
   */
  className?: string;
  /**
   * Test ID applied to the group root.
   */
  'data-testid'?: string;
  /**
   * Whether all buttons in the group are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Accessible label for the group.
   */
  label: string;
  /**
   * Group orientation.
   * @default 'horizontal'
   */
  orientation?: ToggleButtonGroupOrientation;
  /**
   * Ref forwarded to the group root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Default size for buttons in the group.
   */
  size?: ButtonSize;
  /**
   * Inline styles applied to the group root.
   */
  style?: CSSProperties;
}

export interface ToggleButtonGroupSingleProps extends ToggleButtonGroupBaseProps {
  /**
   * Called with the selected value when selection changes, or `null`
   * when the active button is deselected.
   */
  onChange: (value: string | null) => void;
  /**
   * Single-selection mode. Clicking the active button clears selection.
   * @default 'single'
   */
  type?: 'single';
  /**
   * Currently selected value, or `null` for no selection.
   */
  value: string | null;
}

export interface ToggleButtonGroupMultipleProps extends ToggleButtonGroupBaseProps {
  /**
   * Called with the array of selected values when selection changes.
   */
  onChange: (value: string[]) => void;
  /**
   * Multiple-selection mode.
   */
  type: 'multiple';
  /**
   * Currently selected values.
   */
  value: string[];
}

export type ToggleButtonGroupProps =
  ToggleButtonGroupSingleProps | ToggleButtonGroupMultipleProps;

const styles = {
  group: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
  }),
  vertical: css({
    flexDirection: 'column',
    alignItems: 'stretch',
  }),
} as const;

/**
 * Groups related ToggleButtons and manages shared selection state.
 */
export function ToggleButtonGroup({
  children,
  className,
  'data-testid': dataTestId,
  isDisabled = false,
  label,
  orientation = 'horizontal',
  ref,
  size,
  style,
  ...props
}: ToggleButtonGroupProps): React.JSX.Element {
  const isMultiple = props.type === 'multiple';
  const {onChange, value} = props;

  const selectedValues = useMemo(() => {
    if (isMultiple) {
      return new Set(value as string[]);
    }

    return value == null ? new Set<string>() : new Set([value as string]);
  }, [isMultiple, value]);

  const onToggle = useCallback(
    (itemValue: string) => {
      if (isMultiple) {
        const current = value as string[];
        (onChange as (v: string[]) => void)(
          current.includes(itemValue)
            ? current.filter(v => v !== itemValue)
            : [...current, itemValue],
        );
        return;
      }

      const current = value as string | null;
      (onChange as (v: string | null) => void)(
        current === itemValue ? null : itemValue,
      );
    },
    [isMultiple, value, onChange],
  );

  const contextValue = useMemo(
    () => ({isDisabled, onToggle, selectedValues, size}),
    [isDisabled, onToggle, selectedValues, size],
  );

  return (
    <ToggleButtonGroupContext value={contextValue}>
      <div
        aria-disabled={isDisabled || undefined}
        aria-label={label}
        className={cx(
          styles.group,
          orientation === 'vertical' ? styles.vertical : undefined,
          className,
        )}
        data-orientation={orientation}
        data-testid={dataTestId}
        ref={ref}
        role="group"
        style={style}>
        {children}
      </div>
    </ToggleButtonGroupContext>
  );
}

ToggleButtonGroup.displayName = 'ToggleButtonGroup';
