import {
  createContext,
  use,
  useCallback,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import type {ButtonSize} from '../Button';

export type ToggleButtonGroupOrientation = 'horizontal' | 'vertical';

interface ToggleButtonGroupContextValue {
  isDisabled?: boolean;
  selectedValues: Set<string>;
  size?: ButtonSize;
  toggle: (value: string) => void;
}

export const ToggleButtonGroupContext =
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
   * Called with the selected value or values when selection changes.
   */
  onChange: ((value: string | null) => void) | ((value: string[]) => void);
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
   * Single-selection mode. Clicking the active button clears selection.
   * @default 'single'
   */
  type?: 'single';
  /**
   * Currently selected value.
   */
  value: string | null;
}

export interface ToggleButtonGroupMultipleProps extends ToggleButtonGroupBaseProps {
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
  | ToggleButtonGroupSingleProps
  | ToggleButtonGroupMultipleProps;

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

  const selectedValues = useMemo(() => {
    if (isMultiple) {
      return new Set(props.value);
    }

    return props.value == null ? new Set<string>() : new Set([props.value]);
  }, [isMultiple, props.value]);

  const toggle = useCallback(
    (itemValue: string) => {
      if (isMultiple) {
        const current = props.value;
        const onChange = props.onChange as (value: string[]) => void;
        onChange(
          current.includes(itemValue)
            ? current.filter(value => value !== itemValue)
            : [...current, itemValue],
        );
        return;
      }

      const current = props.value;
      const onChange = props.onChange as (value: string | null) => void;
      onChange(current === itemValue ? null : itemValue);
    },
    [isMultiple, props],
  );

  const contextValue = useMemo(
    () => ({isDisabled, selectedValues, size, toggle}),
    [isDisabled, selectedValues, size, toggle],
  );

  return (
    <ToggleButtonGroupContext value={contextValue}>
      <div
        aria-label={label}
        className={cx(
          styles.group,
          orientation === 'vertical' ? styles.vertical : undefined,
          className,
        )}
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
