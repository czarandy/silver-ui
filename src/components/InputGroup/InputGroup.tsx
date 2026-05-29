import {
  useMemo,
  useId,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Field, type InputSize, type InputStatus} from '../Field';
import {InputGroupContext} from './InputGroupContext';

export interface InputGroupProps {
  /**
   * Grouped input children to render side-by-side.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the group wrapper.
   */
  className?: string;
  /**
   * Test ID applied to the group wrapper.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the label.
   */
  description?: ReactNode;
  /**
   * Whether all grouped inputs are disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether to visually hide the label.
   * @default false
   */
  isLabelHidden?: boolean;
  /**
   * Whether the field is optional.
   * @default false
   */
  isOptional?: boolean;
  /**
   * Whether the field is required.
   * @default false
   */
  isRequired?: boolean;
  /**
   * Label text for the input group.
   */
  label: string;
  /**
   * Tooltip content shown next to the label.
   */
  labelTooltip?: ReactNode;
  /**
   * Ref forwarded to the group wrapper.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Visual size applied to the group.
   * @default 'md'
   */
  size?: InputSize;
  /**
   * Validation status displayed below the group.
   */
  status?: InputStatus;
  /**
   * Inline styles applied to the group wrapper.
   */
  style?: CSSProperties;
}

const styles = {
  group: css({
    display: 'inline-flex',
    alignItems: 'stretch',
    minW: 0,
    '& > *': {
      minH: '100%',
      borderRadius: 0,
      ml: '-1px',
    },
    '& > *:first-child': {
      ml: 0,
      borderStartStartRadius: 'md',
      borderEndStartRadius: 'md',
    },
    '& > *:last-child': {
      borderStartEndRadius: 'md',
      borderEndEndRadius: 'md',
    },
    '& > *:focus-within': {
      zIndex: 1,
    },
  }),
  disabled: css({
    cursor: 'not-allowed',
    opacity: 0.55,
  }),
  size: {
    sm: css({h: 'component.sm'}),
    md: css({h: 'component.md'}),
    lg: css({h: 'component.lg'}),
  } satisfies Record<InputSize, string>,
} as const;

/**
 * Groups multiple inputs into a single visually connected row.
 */
export function InputGroup({
  children,
  label,
  description,
  isDisabled = false,
  isLabelHidden = false,
  isOptional = false,
  isRequired = false,
  size = 'md',
  status,
  labelTooltip,
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: InputGroupProps): React.JSX.Element {
  const inputId = useId();
  const contextValue = useMemo(
    () => ({isInGroup: true as const, isDisabled, label}),
    [isDisabled, label],
  );

  return (
    <InputGroupContext value={contextValue}>
      <Field
        description={description}
        inputId={inputId}
        isDisabled={isDisabled}
        isLabelHidden={isLabelHidden}
        isOptional={isOptional}
        isRequired={isRequired}
        label={label}
        labelTooltip={labelTooltip}
        status={status}
        statusVariant="detached">
        <div
          aria-label={label}
          className={cx(
            styles.group,
            styles.size[size],
            isDisabled ? styles.disabled : undefined,
            className,
          )}
          data-testid={dataTestId}
          id={inputId}
          ref={ref}
          role="group"
          style={style}>
          {children}
        </div>
      </Field>
    </InputGroupContext>
  );
}

InputGroup.displayName = 'InputGroup';
