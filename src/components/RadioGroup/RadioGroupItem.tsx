import {use, useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Item} from '../Item';
import {RadioGroupContext} from './RadioGroupContext';

export interface RadioGroupItemProps {
  /**
   * Additional CSS class names applied to the item root.
   */
  className?: string;
  /**
   * Test ID applied to the item root.
   */
  'data-testid'?: string;
  /**
   * Supporting text displayed below the item label.
   */
  description?: ReactNode;
  /**
   * Content rendered after the label and description.
   */
  endContent?: ReactNode;
  /**
   * Whether this radio item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Label text for the radio item.
   */
  label: string;
  /**
   * Ref forwarded to the item root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Content rendered after the radio control and before the label.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the item root.
   */
  style?: CSSProperties;
  /**
   * Value represented by this radio item.
   */
  value: string;
}

const styles = {
  controlWrap: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 'full',
    isolation: 'isolate',
    '&:has(input:focus-visible)': {
      outlineWidth: 'focus',
      outlineStyle: 'solid',
      outlineColor: 'primary',
      outlineOffset: 'focusOffset',
    },
  }),
  input: css({
    position: 'absolute',
    inset: 0,
    m: 0,
    p: 0,
    opacity: 0,
    cursor: 'pointer',
    zIndex: 1,
    _disabled: {
      cursor: 'not-allowed',
    },
  }),
  radio: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 'default',
    borderStyle: 'solid',
    borderColor: 'border.emphasized',
    borderRadius: 'full',
    bg: 'bg',
    pointerEvents: 'none',
  }),
  radioChecked: css({
    bg: 'primary',
    borderColor: 'primary',
  }),
  radioDisabled: css({
    opacity: 0.55,
  }),
  dot: css({
    borderRadius: 'full',
    bg: 'fg.onPrimary',
  }),
  label: css({
    cursor: 'pointer',
  }),
  labelDisabled: css({
    color: 'fg.disabled',
    cursor: 'not-allowed',
  }),
  controlSize: {
    sm: css({w: '5', h: '5'}),
    md: css({w: '6', h: '6'}),
  },
  radioSize: {
    sm: css({w: '4.5', h: '4.5'}),
    md: css({w: '5.5', h: '5.5'}),
  },
  dotSize: {
    sm: css({w: '2', h: '2'}),
    md: css({w: '2.5', h: '2.5'}),
  },
} as const;

/**
 * An individual radio option within a `RadioGroup`.
 */
export function RadioGroupItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  isDisabled: isItemDisabled = false,
  label,
  ref,
  startContent,
  style,
  value,
}: RadioGroupItemProps): React.JSX.Element {
  const context = use(RadioGroupContext);
  if (context == null) {
    throw new Error('RadioGroupItem must be used within a RadioGroup');
  }

  const id = useId();
  const descriptionId = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;
  const control = (
    <span className={cx(styles.controlWrap, styles.controlSize[size])}>
      <input
        aria-describedby={description != null ? descriptionId : undefined}
        checked={isChecked}
        className={styles.input}
        disabled={isDisabled}
        id={id}
        name={context.name}
        onChange={() => context.onChange(value)}
        required={context.isRequired}
        type="radio"
        value={value}
      />
      <span
        aria-hidden="true"
        className={cx(
          styles.radio,
          styles.radioSize[size],
          isChecked ? styles.radioChecked : undefined,
          isDisabled ? styles.radioDisabled : undefined,
        )}>
        {isChecked ? (
          <span className={cx(styles.dot, styles.dotSize[size])} />
        ) : null}
      </span>
    </span>
  );

  return (
    <Item
      className={className}
      data-testid={dataTestId}
      description={
        description != null ? (
          <span id={descriptionId}>{description}</span>
        ) : undefined
      }
      endContent={endContent}
      endContentPosition="inline"
      isDisabled={isDisabled}
      label={
        <label
          className={cx(
            styles.label,
            isDisabled ? styles.labelDisabled : undefined,
          )}
          htmlFor={id}>
          {label}
        </label>
      }
      leadingContent={control}
      ref={ref}
      startContent={startContent}
      style={style}
      width={context.orientation === 'horizontal' ? 'auto' : 'full'}
    />
  );
}

RadioGroupItem.displayName = 'RadioGroupItem';
