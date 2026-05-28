import {Star} from 'lucide-react';
import {useState, type CSSProperties, type ReactNode, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Icon, type IconSize} from '../Icon';

export interface RatingProps {
  className?: string;
  count?: number;
  'data-testid'?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  label?: string;
  onChange?: (value: number) => void;
  ref?: Ref<HTMLDivElement>;
  size?: IconSize;
  style?: CSSProperties;
  value: number;
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5',
  }),
  star: css({
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    p: 0,
    m: 0,
    borderWidth: 0,
    bg: 'transparent',
    _focusVisible: {
      outline: '2px solid',
      outlineColor: 'primary',
      outlineOffset: '2px',
      borderRadius: 'sm',
    },
  }),
  disabled: css({
    opacity: 0.5,
    cursor: 'not-allowed',
  }),
  readOnly: css({
    cursor: 'default',
  }),
  filled: css({
    color: 'yellow.400',
    fill: 'currentColor',
  }),
  empty: css({
    color: 'silver-neutral.300',
  }),
  input: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
  srOnly: css({
    position: 'absolute',
    w: '1px',
    h: '1px',
    p: 0,
    m: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }),
} as const;

function StarIcon({
  isFilled,
  size,
}: {
  isFilled: boolean;
  size: IconSize;
}): ReactNode {
  return (
    <Icon
      className={isFilled ? styles.filled : styles.empty}
      fill={isFilled ? 'currentColor' : 'none'}
      icon={Star}
      size={size}
    />
  );
}

export function Rating({
  value,
  onChange,
  count = 5,
  size = 'md',
  isReadOnly = false,
  isDisabled = false,
  label = 'Rating',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: RatingProps): React.JSX.Element {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = !isReadOnly && !isDisabled && onChange != null;
  const displayValue = isInteractive ? (hoverValue ?? value) : value;

  if (!isInteractive) {
    return (
      <div
        aria-label={`${label}: ${value} out of ${count}`}
        className={cx(
          styles.root,
          isDisabled ? styles.disabled : undefined,
          className,
        )}
        data-testid={dataTestId}
        ref={ref}
        role="img"
        style={style}>
        {Array.from({length: count}, (_, i) => (
          <span className={styles.readOnly} key={i}>
            <StarIcon isFilled={i < value} size={size} />
          </span>
        ))}
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y-x/interactive-supports-focus -- focus is managed by the radio inputs inside
    <div
      aria-label={label}
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      onMouseLeave={() => setHoverValue(null)}
      ref={ref}
      role="radiogroup"
      style={style}>
      {Array.from({length: count}, (_, i) => {
        const starValue = i + 1;
        return (
          // eslint-disable-next-line jsx-a11y-x/no-noninteractive-element-interactions -- label wraps its radio input
          <label
            className={styles.star}
            key={i}
            onMouseEnter={() => setHoverValue(starValue)}>
            <input
              checked={value === starValue}
              className={styles.input}
              name={label}
              onChange={() => onChange(starValue)}
              type="radio"
              value={starValue}
            />
            <span className={styles.srOnly}>
              {starValue} {starValue === 1 ? 'star' : 'stars'}
            </span>
            <StarIcon isFilled={i < displayValue} size={size} />
          </label>
        );
      })}
    </div>
  );
}

Rating.displayName = 'Rating';
