import type {CSSProperties, ReactNode, Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {useTableContext} from './TableContext';

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  ref?: Ref<HTMLTableRowElement>;
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
        bg: 'silver-neutral.50',
      },
    },
  }),
  striped: css({
    _even: {
      bg: 'silver-neutral.50',
    },
  }),
  stripedHover: css({
    _even: {
      bg: 'silver-neutral.50',
    },
    _hover: {
      '@media (hover: hover)': {
        bg: 'silver-neutral.100',
      },
    },
  }),
} as const;

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
