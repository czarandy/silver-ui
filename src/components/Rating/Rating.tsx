'use client';

import {Star} from 'lucide-react';
import {
  useState,
  useId,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {Icon, type IconColor, type IconSize} from 'components/Icon';
import {ratingRecipe} from 'components/Rating/Rating.recipe';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {cx} from 'utils/cx';

export interface RatingProps {
  /**
   * Additional CSS class names applied to the rating root.
   */
  className?: string;
  /**
   * Number of stars to display.
   * @default 5
   */
  count?: number;
  /**
   * Test ID applied to the rating root.
   */
  'data-testid'?: string;
  /**
   * Color of unfilled stars.
   * @default 'disabled'
   */
  emptyColor?: IconColor;
  /**
   * Color of filled stars.
   * @default 'yellow'
   */
  filledColor?: IconColor;
  /**
   * HTML name attribute shared by radio inputs for native form submission.
   */
  htmlName?: string;
  /**
   * Whether the rating is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the rating is read-only.
   * @default false
   */
  isReadOnly?: boolean;
  /**
   * Accessible label for the rating group.
   * @default 'Rating'
   */
  label?: string;
  /**
   * Called when the selected rating changes.
   */
  onChange?: (value: number) => void;
  /**
   * Ref forwarded to the rating root.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Size of the star icons.
   * @default 'md'
   */
  size?: IconSize;
  /**
   * Inline styles applied to the rating root.
   */
  style?: CSSProperties;
  /**
   * Current rating value.
   */
  value: number;
}

function StarIcon({
  color,
  isFilled,
  size,
}: {
  color: IconColor;
  isFilled: boolean;
  size: IconSize;
}): ReactNode {
  return (
    <Icon
      color={color}
      fill={isFilled ? 'currentColor' : 'none'}
      icon={Star}
      size={size}
    />
  );
}

/**
 * Star-based rating control supporting read-only and interactive modes.
 */
export function Rating({
  value: valueFromProps,
  onChange,
  count = 5,
  emptyColor = 'disabled',
  filledColor = 'yellow',
  htmlName,
  size = 'md',
  isReadOnly = false,
  isDisabled = false,
  label = 'Rating',
  className,
  'data-testid': dataTestId,
  style,
  ref,
}: RatingProps): React.JSX.Element {
  if (process.env.NODE_ENV !== 'production') {
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(
        `Rating: count must be a positive integer, received ${count}.`,
      );
    }

    if (
      valueFromProps < 0 ||
      valueFromProps > count ||
      !Number.isInteger(valueFromProps)
    ) {
      throw new Error(
        `Rating: value must be an integer in [0, ${count}], received ${valueFromProps}.`,
      );
    }
  }

  const value = Math.max(0, Math.min(count, Math.round(valueFromProps)));
  const groupId = useId();
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const isInteractive = !isReadOnly && !isDisabled && onChange != null;
  const displayValue = isInteractive ? (hoverValue ?? value) : value;
  const classes = ratingRecipe({
    isDisabled: isDisabled || undefined,
    isReadOnly: isReadOnly || undefined,
  });

  if (!isInteractive) {
    return (
      <div
        aria-label={`${label}: ${value} out of ${count}`}
        className={cx(classes.root, className)}
        data-testid={dataTestId}
        ref={ref}
        role="img"
        style={style}>
        {Array.from({length: count}, (_, i) => (
          <span className={classes.star} key={i}>
            <StarIcon
              color={i < value ? filledColor : emptyColor}
              isFilled={i < value}
              size={size}
            />
          </span>
        ))}
      </div>
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y-x/interactive-supports-focus -- focus is managed by the radio inputs inside
    <div
      aria-label={label}
      className={cx(classes.root, className)}
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
            className={classes.star}
            key={i}
            onMouseEnter={() => setHoverValue(starValue)}>
            <input
              checked={value === starValue}
              className={classes.input}
              name={htmlName ?? groupId}
              onChange={() => onChange(starValue)}
              type="radio"
              value={starValue}
            />
            <VisuallyHidden>
              {starValue} {starValue === 1 ? 'star' : 'stars'}
            </VisuallyHidden>
            <StarIcon
              color={i < displayValue ? filledColor : emptyColor}
              isFilled={i < displayValue}
              size={size}
            />
          </label>
        );
      })}
    </div>
  );
}

Rating.displayName = 'Rating';
