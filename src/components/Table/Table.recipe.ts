import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Slot recipe consolidating the Table family's context-driven styling. The
 * structural sub-components (`TableCell`, `TableHeaderCell`, `TableRow`) read
 * shared visual state from `TableContext` and each render a single slot from
 * this recipe; `Table` owns the `wrapper`, `table`, `headerLabelRow`, and
 * `emptyState` slots. The `density`/`dividers` variants previously lived
 * duplicated across the cell and header-cell components and are unified here.
 */
export const tableRecipe = sva({
  slots: [
    'wrapper',
    'table',
    'headerLabelRow',
    'emptyState',
    'row',
    'cell',
    'headerCell',
  ],
  base: {
    wrapper: {
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch',
      // Only reachable while the region overflows and Table makes it focusable.
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
        borderRadius: 'sm',
      },
    },
    table: {
      color: 'fg',
      fontFamily: 'body',
      w: 'full',
      borderCollapse: 'collapse',
      borderSpacing: 0,
      tableLayout: 'fixed',
    },
    headerLabelRow: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      minW: 0,
    },
    emptyState: {
      py: '8',
    },
    row: {
      transitionDuration: 'fast',
      transitionProperty: 'background-color',
      transitionTimingFunction: 'default',
    },
    cell: {
      maxWidth: 0,
    },
    headerCell: {
      color: 'fg.muted',
      fontWeight: 'semibold',
      maxWidth: 0,
      overflow: 'hidden',
      textAlign: 'start',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      borderBottomWidth: 'default',
      borderBottomStyle: 'solid',
      borderBottomColor: 'border',
    },
  },
  variants: {
    density: {
      balanced: {
        cell: {fontSize: 'md', px: '3', py: '2'},
        headerCell: {fontSize: 'md', px: '3', py: '2'},
      },
      compact: {
        cell: {fontSize: 'md', px: '2', py: '1'},
        headerCell: {fontSize: 'md', px: '2', py: '1'},
      },
      spacious: {
        cell: {fontSize: 'md', px: '4', py: '3'},
        headerCell: {fontSize: 'md', px: '4', py: '3'},
      },
    },
    dividers: {
      none: {},
      rows: {
        cell: {
          borderBottomWidth: 'default',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
          'tbody > tr:last-child > &': {
            borderBottomWidth: 0,
          },
        },
      },
      columns: {
        cell: {
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
          _last: {
            borderInlineEndWidth: 0,
          },
        },
        headerCell: {
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
          _last: {
            borderInlineEndWidth: 0,
          },
        },
      },
      grid: {
        cell: {
          borderBottomWidth: 'default',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
          'tbody > tr:last-child > &': {
            borderBottomWidth: 0,
          },
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
          _last: {
            borderInlineEndWidth: 0,
          },
        },
        headerCell: {
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
          _last: {
            borderInlineEndWidth: 0,
          },
        },
      },
    },
    verticalAlign: {
      middle: {cell: {verticalAlign: 'middle'}},
      top: {cell: {verticalAlign: 'top'}},
      bottom: {cell: {verticalAlign: 'bottom'}},
    },
    textOverflow: {
      truncate: {
        cell: {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
      wrap: {
        cell: {
          overflow: 'hidden',
          overflowWrap: 'break-word',
          whiteSpace: 'normal',
          wordBreak: 'break-word',
        },
      },
    },
    // Row background variants. Striping and hover combine, so the combined
    // presentation lives in compoundVariants below.
    isStriped: {
      true: {},
      false: {},
    },
    hasHover: {
      true: {},
      false: {},
    },
    // Auto layout when the table renders consumer-provided children; the
    // default fixed layout lives in the base `table` slot.
    isAutoLayout: {
      true: {table: {tableLayout: 'auto'}},
      false: {},
    },
  },
  compoundVariants: [
    {
      isStriped: false,
      hasHover: true,
      css: {
        row: {
          _hover: {
            '@media (hover: hover)': {
              bg: 'bg.subtle',
            },
          },
        },
      },
    },
    {
      isStriped: true,
      hasHover: false,
      css: {
        row: {
          _even: {
            bg: 'bg.subtle',
          },
        },
      },
    },
    {
      isStriped: true,
      hasHover: true,
      css: {
        row: {
          _even: {
            bg: 'bg.subtle',
          },
          _hover: {
            '@media (hover: hover)': {
              bg: 'bg.hover',
            },
          },
        },
      },
    },
  ],
  defaultVariants: {
    density: 'balanced',
    dividers: 'rows',
    verticalAlign: 'middle',
    textOverflow: 'wrap',
    isStriped: false,
    hasHover: false,
    isAutoLayout: false,
  },
});

export type TableVariants = RecipeVariantProps<typeof tableRecipe>;
