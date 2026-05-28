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
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  description?: ReactNode;
  isDisabled?: boolean;
  isLabelHidden?: boolean;
  isOptional?: boolean;
  isRequired?: boolean;
  label: string;
  labelTooltip?: ReactNode;
  ref?: Ref<HTMLDivElement>;
  size?: InputSize;
  status?: InputStatus;
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
