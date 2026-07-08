'use client';

import type {CSSProperties, Ref} from 'react';
import {Text} from 'components/Text';
import type {TextColor, TextSize, TextType, TextWeight} from 'components/Text';
import {
  formatTimestamp,
  type TimestampFormat,
  type TimestampValue,
} from 'components/Timestamp/Timestamp.utils';
import {useTooltip} from 'components/Tooltip';
import {mergeRefs} from 'internal/mergeRefs';

export type {TimestampFormat, TimestampValue};

/**
 * Displays a single moment in time as a semantic `<time>` element, either
 * relative to now ("2 hours ago") or as an absolute date/time.
 */
export interface TimestampProps {
  /**
   * In `auto` mode, the maximum age in seconds for which a relative string is
   * shown before falling back to an absolute date/time.
   * @default 604800 (7 days)
   */
  autoThreshold?: number;
  /**
   * Additional CSS class names applied to the element.
   */
  className?: string;
  /**
   * Text color token. Passed through to the underlying `Text`.
   * @default 'secondary'
   */
  color?: TextColor;
  /**
   * Test ID applied to the element.
   */
  'data-testid'?: string;
  /**
   * How to format the timestamp.
   * @default 'auto'
   */
  format?: TimestampFormat;
  /**
   * Whether to show a tooltip with the full absolute date/time on hover. Only
   * applies while the visible text is relative.
   * @default true
   */
  hasTooltip?: boolean;
  /**
   * Whether to append the timezone abbreviation to absolute (non-system)
   * formats.
   * @default false
   */
  isTimezoneShown?: boolean;
  /**
   * Ref forwarded to the `<time>` element.
   */
  ref?: Ref<HTMLTimeElement>;
  /**
   * Font size token. Passed through to the underlying `Text`.
   */
  size?: TextSize;
  /**
   * Inline styles applied to the element.
   */
  style?: CSSProperties;
  /**
   * Typographic preset. Passed through to the underlying `Text`.
   * @default 'supporting'
   */
  type?: TextType;
  /**
   * The moment to display. Accepts a `Temporal.Instant` or `ZonedDateTime`, a
   * Unix epoch timestamp in **seconds**, or an ISO 8601 string.
   */
  value: TimestampValue;
  /**
   * Font weight. Passed through to the underlying `Text`.
   */
  weight?: TextWeight;
}

export function Timestamp({
  autoThreshold = 604800,
  className,
  color = 'secondary',
  'data-testid': dataTestId,
  format = 'auto',
  hasTooltip = true,
  isTimezoneShown = false,
  ref,
  size,
  style,
  type = 'supporting',
  value,
  weight,
}: TimestampProps): React.JSX.Element {
  const {absoluteLabel, dateTime, isRelative, text} = formatTimestamp(
    value,
    format,
    autoThreshold,
    isTimezoneShown,
  );

  const isTooltipEnabled = hasTooltip && isRelative;
  const tooltip = useTooltip({isEnabled: isTooltipEnabled});

  return (
    <>
      <Text
        aria-describedby={isTooltipEnabled ? tooltip.describedBy : undefined}
        aria-label={isRelative ? absoluteLabel : undefined}
        as="time"
        className={className}
        color={color}
        data-testid={dataTestId}
        dateTime={dateTime}
        ref={mergeRefs<HTMLTimeElement>(ref, tooltip.ref)}
        size={size}
        style={style}
        type={type}
        weight={weight}>
        {text}
      </Text>
      {isTooltipEnabled ? tooltip.renderTooltip(absoluteLabel) : null}
    </>
  );
}

Timestamp.displayName = 'Timestamp';
