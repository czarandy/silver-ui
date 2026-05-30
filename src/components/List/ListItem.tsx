import {
  use,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {Item} from '../Item';
import {ListContext, type ListStyle} from './ListContext';

export interface ListItemProps {
  /**
   * Additional CSS class names applied to the list item.
   */
  className?: string;
  /**
   * Test ID applied to the list item.
   */
  'data-testid'?: string;
  /**
   * Supporting text shown below the label.
   */
  description?: ReactNode;
  /**
   * Trailing content rendered after the label area.
   */
  endContent?: ReactNode;
  /**
   * Link URL. When set, the content area renders as a link.
   */
  href?: string;
  /**
   * Whether the item is disabled.
   * @default false
   */
  isDisabled?: boolean;
  /**
   * Whether the item is selected.
   * @default false
   */
  isSelected?: boolean;
  /**
   * Primary item label.
   */
  label: ReactNode;
  /**
   * Click handler for interactive items.
   */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Ref forwarded to the list item.
   */
  ref?: Ref<HTMLLIElement>;
  /**
   * Link relationship.
   */
  rel?: string;
  /**
   * Content rendered before the label area.
   */
  startContent?: ReactNode;
  /**
   * Inline styles applied to the list item.
   */
  style?: CSSProperties;
  /**
   * Link target.
   */
  target?: string;
}

const markerSize = '6px';

const styles = {
  withCounter: css({
    counterIncrement: 'silver-list',
  }),
  withDivider: css({
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: 'border',
    _last: {
      borderBlockEndWidth: 0,
    },
  }),
  noRadius: css({
    borderRadius: 0,
  }),
  markerContainer: css({
    alignSelf: 'baseline',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    w: '4',
    mt: `calc((1em * 1.5 - ${markerSize}) / 2)`,
  }),
  dot: css({
    w: markerSize,
    h: markerSize,
    borderRadius: 'full',
    bg: 'fg',
  }),
  circle: css({
    w: markerSize,
    h: markerSize,
    borderRadius: 'full',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'fg',
    bg: 'transparent',
  }),
  number: css({
    alignSelf: 'baseline',
    flexShrink: 0,
    color: 'fg',
    fontFamily: 'body',
    fontSize: 'md',
    lineHeight: '1.5',
    w: '4',
    _before: {
      content: 'counter(silver-list) "."',
    },
  }),
} as const;

function Marker({listStyle}: {listStyle: ListStyle}): React.JSX.Element | null {
  if (listStyle === 'disc') {
    return (
      <span className={styles.markerContainer}>
        <span className={styles.dot} />
      </span>
    );
  }

  if (listStyle === 'circle') {
    return (
      <span className={styles.markerContainer}>
        <span className={styles.circle} />
      </span>
    );
  }

  if (listStyle === 'decimal') {
    return <span className={styles.number} />;
  }

  return null;
}

/**
 * Structured list item built on the shared `Item` primitive.
 */
export function ListItem({
  className,
  'data-testid': dataTestId,
  description,
  endContent,
  href,
  isDisabled = false,
  isSelected = false,
  label,
  onClick,
  ref,
  rel,
  startContent,
  style,
  target,
}: ListItemProps): React.JSX.Element {
  const context = use(ListContext);
  const density = context?.density ?? 'balanced';
  const hasDividers = context?.hasDividers ?? false;
  const listStyle = context?.listStyle ?? 'none';
  const hasMarkers = listStyle !== 'none';

  return (
    <Item
      as="li"
      className={cx(
        hasMarkers ? styles.withCounter : undefined,
        hasDividers ? styles.withDivider : undefined,
        hasDividers ? styles.noRadius : undefined,
        className,
      )}
      data-testid={dataTestId}
      density={density === 'compact' ? 'compact' : 'default'}
      description={description}
      endContent={endContent}
      href={href}
      isDisabled={isDisabled}
      isSelected={isSelected}
      label={label}
      leadingContent={<Marker listStyle={listStyle} />}
      onClick={onClick}
      ref={ref}
      rel={rel}
      startContent={startContent}
      style={style}
      target={target}
    />
  );
}

ListItem.displayName = 'ListItem';
