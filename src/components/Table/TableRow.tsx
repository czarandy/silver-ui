import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useTableContext} from './TableContext';

export interface TableRowProps {
  /**
   * Cell elements rendered inside the row.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the tr.
   */
  className?: string;
  /**
   * Test ID applied to the tr.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the tr element.
   */
  ref?: Ref<HTMLTableRowElement>;
  /**
   * Inline styles applied to the tr.
   */
  style?: CSSProperties;
}

const styles = {
  base: css({
    transitionDuration: 'fast',
    transitionProperty: 'background-color',
    transitionTimingFunction: 'default',
  }),
  hover: css({
    _hover: {
      '@media (hover: hover)': {
        bg: 'bg.subtle',
      },
    },
  }),
  striped: css({
    _even: {
      bg: 'bg.subtle',
    },
  }),
  stripedHover: css({
    _even: {
      bg: 'bg.subtle',
    },
    _hover: {
      '@media (hover: hover)': {
        bg: 'bg.hover',
      },
    },
  }),
} as const;

/**
 * Table row with hover and striped styling from context.
 */
export function TableRow({
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: TableRowProps): React.JSX.Element {
  const context = useTableContext();
  const rowClassName =
    context == null
      ? undefined
      : context.isStriped && context.hasHover
        ? styles.stripedHover
        : context.isStriped
          ? styles.striped
          : context.hasHover
            ? styles.hover
            : undefined;

  return (
    <tr
      className={cx('silver-table-row', styles.base, rowClassName, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {children}
    </tr>
  );
}

TableRow.displayName = 'TableRow';
