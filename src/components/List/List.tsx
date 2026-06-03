import {
  useId,
  useMemo,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {ListContext, type ListStyle} from './ListContext';

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

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
  }),
  list: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
    m: 0,
    p: 0,
    listStyleType: 'none',
  }),
  withDividers: css({
    gap: 0,
  }),
  withCounter: css({
    counterReset: 'silver-list',
  }),
  header: css({
    mb: '2',
  }),
} as const;

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
  const Component = isOrdered ? 'ol' : 'ul';
  const counterReset =
    listStyle !== 'none' && start != null && start !== 1
      ? `silver-list ${start - 1}`
      : undefined;
  const contextValue = useMemo(
    () => ({hasDividers, listStyle}),
    [hasDividers, listStyle],
  );

  const listElement = (
    <Component
      aria-labelledby={header != null ? headerId : undefined}
      className={cx(
        styles.list,
        hasDividers ? styles.withDividers : undefined,
        listStyle !== 'none' ? styles.withCounter : undefined,
        className,
      )}
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
      {header == null ? (
        listElement
      ) : (
        <div className={styles.root}>
          <div className={styles.header} id={headerId}>
            {header}
          </div>
          {listElement}
        </div>
      )}
    </ListContext>
  );
}

List.displayName = 'List';
