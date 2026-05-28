import {use, useId, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Text} from '../Text';
import {RadioListContext} from './RadioListContext';

export interface RadioListItemProps {
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
  root: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
    minW: 0,
  }),
  controlWrap: css({
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 'full',
    isolation: 'isolate',
    '&:has(input:focus-visible)': {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
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
    boxSizing: 'border-box',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'silver-neutral.400',
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
    bg: 'white',
  }),
  content: css({
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minW: 0,
  }),
  label: css({
    cursor: 'pointer',
  }),
  labelDisabled: css({
    color: 'silver-neutral.400',
    cursor: 'not-allowed',
  }),
  startContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
  }),
  endContent: css({
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: 0,
    ms: 'auto',
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
 * An individual radio option within a `RadioList`.
 */
export function RadioListItem({
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
}: RadioListItemProps): React.JSX.Element {
  const context = use(RadioListContext);
  if (context == null) {
    throw new Error('RadioListItem must be used within a RadioList');
  }

  const id = useId();
  const descriptionId = useId();
  const isDisabled = context.isDisabled || isItemDisabled;
  const isChecked = context.value === value;
  const size = context.size;

  return (
    <div
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
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
      {startContent != null ? (
        <span className={styles.startContent}>{startContent}</span>
      ) : null}
      <span className={styles.content}>
        <Text
          as="label"
          className={cx(styles.label, isDisabled && styles.labelDisabled)}
          color="inherit"
          htmlFor={id}
          type="label">
          {label}
        </Text>
        {description != null ? (
          <Text
            as="span"
            color={isDisabled ? 'disabled' : 'secondary'}
            id={descriptionId}
            type="supporting">
            {description}
          </Text>
        ) : null}
      </span>
      {endContent != null ? (
        <span className={styles.endContent}>{endContent}</span>
      ) : null}
    </div>
  );
}

RadioListItem.displayName = 'RadioListItem';
