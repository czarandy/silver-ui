import type {Temporal} from '@js-temporal/polyfill';
import type {CSSProperties, ReactNode, Ref} from 'react';
import {Text} from 'components/Text';
import {timelineRecipe} from 'components/Timeline/Timeline.recipe';
import {Timestamp, type TimestampFormat} from 'components/Timestamp';
import isReactNode from 'internal/isReactNode';
import {cx} from 'utils/cx';

const classes = timelineRecipe();

export interface TimelineItemConfig {
  /**
   * Free-form detail rendered below the entry title.
   */
  content?: ReactNode;
  /**
   * Test ID applied to the entry's list item.
   */
  'data-testid'?: string;
  /**
   * Custom decorative indicator content replacing the default dot.
   */
  icon?: ReactNode;
  /**
   * Stable identifier used as the React key when rendering.
   */
  id: string;
  /**
   * The moment represented by this entry.
   */
  timestamp: Temporal.Instant | Temporal.ZonedDateTime;
  /**
   * Entry title.
   */
  title: string;
}

export interface TimelineProps {
  /**
   * Additional CSS class names applied to the ordered list.
   */
  className?: string;
  /**
   * Test ID applied to the ordered list.
   */
  'data-testid'?: string;
  /**
   * Timeline entries, rendered in the supplied order.
   */
  items: TimelineItemConfig[];
  /**
   * Ref forwarded to the ordered list.
   */
  ref?: Ref<HTMLOListElement>;
  /**
   * Inline styles applied to the ordered list.
   */
  style?: CSSProperties;
  /**
   * How to format every entry's timestamp.
   * @default 'auto'
   */
  timestampFormat?: TimestampFormat;
}

/**
 * Displays an ordered sequence of timestamped events on a vertical time axis.
 */
export function Timeline({
  className,
  'data-testid': dataTestId,
  items,
  ref,
  style,
  timestampFormat = 'auto',
}: TimelineProps): React.JSX.Element {
  return (
    <ol
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {items.map((item, index) => (
        <li
          className={classes.item}
          data-testid={item['data-testid']}
          key={item.id}>
          <div aria-hidden="true" className={classes.indicatorColumn}>
            <div className={classes.indicator}>
              {isReactNode(item.icon) ? (
                item.icon
              ) : (
                <span className={classes.dot} data-timeline-dot="" />
              )}
            </div>
            {index < items.length - 1 ? (
              <div className={classes.connector} data-timeline-connector="" />
            ) : null}
          </div>
          <div className={classes.content} data-timeline-content="">
            <Timestamp
              className={classes.timestamp}
              format={timestampFormat}
              value={item.timestamp}
            />
            <Text as="span" className={classes.title} type="label">
              {item.title}
            </Text>
            {isReactNode(item.content) ? (
              <div className={classes.body}>{item.content}</div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

Timeline.displayName = 'Timeline';
