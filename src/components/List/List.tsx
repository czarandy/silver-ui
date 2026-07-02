'use client';

import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {listRecipe} from 'components/List/List.recipe';
import {ListContext, type ListStyle} from 'components/List/ListContext';
import {cx} from 'internal/cx';
import isReactNode from 'internal/isReactNode';

export type {ListStyle};

export interface ListProps {
  /**
   * List items.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the list element.
   */
  className?: string;
  /**
   * Test ID applied to the list element.
   */
  'data-testid'?: string;
  /**
   * Whether to show dividers between list items.
   * @default false
   */
  hasDividers?: boolean;
  /**
   * Header content rendered above and associated with the list.
   */
  header?: ReactNode;
  /**
   * List marker style. `decimal` renders an ordered list.
   * @default 'none'
   */
  listStyle?: ListStyle;
  /**
   * Ref forwarded to the list element.
   */
  ref?: Ref<HTMLUListElement | HTMLOListElement>;
  /**
   * Starting number for ordered lists.
   * @default 1
   */
  start?: number;
  /**
   * Inline styles applied to the list element.
   */
  style?: CSSProperties;
}

/**
 * Semantic vertical list container with optional dividers, markers, and header.
 */
export function List({
  children,
  className,
  'data-testid': dataTestId,
  hasDividers = false,
  header,
  listStyle = 'none',
  ref,
  start,
  style,
}: ListProps): React.JSX.Element {
  const headerId = useId();
  const isOrdered = listStyle === 'decimal';
  const hasCounter = isOrdered;
  const Component = isOrdered ? 'ol' : 'ul';
  const counterReset =
    hasCounter && start != null && start !== 1
      ? `silver-list ${start - 1}`
      : undefined;
  const contextValue = useMemo(
    () => ({hasDividers, listStyle}),
    [hasDividers, listStyle],
  );

  const classes = listRecipe({hasDividers, hasCounter});

  const listElement = (
    <Component
      aria-labelledby={isReactNode(header) ? headerId : undefined}
      className={cx(classes.list, className)}
      data-testid={dataTestId}
      ref={ref as Ref<HTMLUListElement & HTMLOListElement>}
      role={listStyle === 'none' && !isOrdered ? 'list' : undefined}
      start={isOrdered ? start : undefined}
      style={{counterReset, ...style}}>
      {children}
    </Component>
  );

  return (
    <ListContext value={contextValue}>
      {!isReactNode(header) ? (
        listElement
      ) : (
        <div className={classes.root}>
          <div className={classes.header} id={headerId}>
            {header}
          </div>
          {listElement}
        </div>
      )}
    </ListContext>
  );
}

List.displayName = 'List';
