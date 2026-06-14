import {sva, type RecipeVariantProps} from 'styled-system/css';

export const badgeRecipe = sva({
  slots: ['root', 'label'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'full',
      fontFamily: 'body',
      lineHeight: 'none',
      fontWeight: 'medium',
      whiteSpace: 'nowrap',
    },
    label: {
      // Optically center the text — nudges it up 1px against the cap height.
      // Scoped to the label slot so any leading icon stays vertically centered.
      paddingBottom: '1px',
    },
  },
  variants: {
    size: {
      sm: {root: {gap: '1', h: '5', px: '2', fontSize: 'sm'}},
      md: {root: {gap: '1.5', h: '6', px: '2.5', fontSize: 'sm'}},
      lg: {root: {gap: '2', h: '7', px: '3', fontSize: 'md'}},
    },
    color: {
      neutral: {root: {bg: 'surface.gray', color: 'fg'}},
      info: {root: {bg: 'status.info.solid', color: 'status.info.solidFg'}},
      success: {
        root: {bg: 'status.success.solid', color: 'status.success.solidFg'},
      },
      warning: {
        root: {bg: 'status.warning.solid', color: 'status.warning.solidFg'},
      },
      error: {root: {bg: 'status.error.solid', color: 'status.error.solidFg'}},
      blue: {root: {bg: 'surface.blue', color: 'surface.blue.fg'}},
      cyan: {root: {bg: 'surface.cyan', color: 'surface.cyan.fg'}},
      green: {root: {bg: 'surface.green', color: 'surface.green.fg'}},
      orange: {root: {bg: 'surface.orange', color: 'surface.orange.fg'}},
      pink: {root: {bg: 'surface.pink', color: 'surface.pink.fg'}},
      purple: {root: {bg: 'surface.purple', color: 'surface.purple.fg'}},
      red: {root: {bg: 'surface.red', color: 'surface.red.fg'}},
      teal: {root: {bg: 'surface.teal', color: 'surface.teal.fg'}},
      yellow: {root: {bg: 'surface.yellow', color: 'surface.yellow.fg'}},
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'neutral',
  },
});

export type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;
