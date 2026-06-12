import {
  use,
  type CSSProperties,
  type MouseEventHandler,
  type ReactNode,
  type Ref,
} from 'react';
import {cx} from 'internal/cx';
import {Item} from '../Item';
import {listItemRecipe} from './List.recipe';
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

type MarkerClasses = ReturnType<typeof listItemRecipe>;

function Marker({
  classes,
  listStyle,
}: {
  classes: MarkerClasses;
  listStyle: ListStyle;
}): React.JSX.Element | null {
  if (listStyle === 'disc') {
    return (
      <span className={classes.markerContainer}>
        <span className={classes.dot} />
      </span>
    );
  }

  if (listStyle === 'circle') {
    return (
      <span className={classes.markerContainer}>
        <span className={classes.circle} />
      </span>
    );
  }

  if (listStyle === 'decimal') {
    return <span className={classes.number} />;
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
  const hasDividers = context?.hasDividers ?? false;
  const listStyle = context?.listStyle ?? 'none';
  const hasCounter = listStyle === 'decimal';
  const hasMarkers = listStyle !== 'none';
  const classes = listItemRecipe({hasCounter, hasDividers});

  return (
    <Item
      as="li"
      className={cx(classes.item, className)}
      data-testid={dataTestId}
      description={description}
      endContent={endContent}
      href={href}
      isDisabled={isDisabled}
      isSelected={isSelected}
      label={label}
      leadingContent={
        hasMarkers ? (
          <Marker classes={classes} listStyle={listStyle} />
        ) : undefined
      }
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
