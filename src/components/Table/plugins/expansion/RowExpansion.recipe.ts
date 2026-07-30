import {sva} from 'styled-system/css';

export const rowExpansionRecipe = sva({
  slots: ['cell', 'toggleButton', 'toggleSpacer', 'toggleIcon'],
  base: {
    cell: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      // Depth-based indentation: the inline cell wrapper sets the CSS variable
      // to `depth - 1`, so each nesting level shifts by one spacing step.
      paddingInlineStart:
        'calc(var(--table-expansion-indent, 0) * token(spacing.6))',
    },
    toggleButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '6',
      h: '6',
      borderRadius: 'sm',
      color: 'fg.muted',
      cursor: 'pointer',
      transitionDuration: 'fast',
      transitionProperty: 'background-color, color',
      transitionTimingFunction: 'default',
      _hover: {
        '@media (hover: hover)': {
          bg: 'bg.subtle',
          color: 'fg',
        },
      },
    },
    toggleSpacer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '6',
      h: '6',
    },
    toggleIcon: {
      display: 'flex',
      transitionDuration: 'fast',
      transitionProperty: 'transform',
      transitionTimingFunction: 'default',
    },
  },
  variants: {
    isExpanded: {
      true: {
        toggleIcon: {transform: 'rotate(90deg)'},
      },
      false: {},
    },
  },
  defaultVariants: {
    isExpanded: false,
  },
});
