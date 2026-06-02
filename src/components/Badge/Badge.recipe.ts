import {cva, type RecipeVariantProps} from 'styled-system/css';

export const badgeRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'full',
    fontFamily: 'body',
    lineHeight: 'none',
    fontWeight: 'medium',
    whiteSpace: 'nowrap',
  },
  variants: {
    size: {
      sm: {gap: '1', h: '5', px: '2', fontSize: 'sm'},
      md: {gap: '1.5', h: '6', px: '2.5', fontSize: 'sm'},
      lg: {gap: '2', h: '7', px: '3', fontSize: 'md'},
    },
    color: {
      neutral: {bg: 'surface.gray', color: 'fg'},
      info: {bg: 'status.info.solid', color: 'status.info.solidFg'},
      success: {bg: 'status.success.solid', color: 'status.success.solidFg'},
      warning: {bg: 'status.warning.solid', color: 'status.warning.solidFg'},
      error: {bg: 'status.error.solid', color: 'status.error.solidFg'},
      blue: {bg: 'surface.blue', color: 'surface.blue.fg'},
      cyan: {bg: 'surface.cyan', color: 'surface.cyan.fg'},
      green: {bg: 'surface.green', color: 'surface.green.fg'},
      orange: {bg: 'surface.orange', color: 'surface.orange.fg'},
      pink: {bg: 'surface.pink', color: 'surface.pink.fg'},
      purple: {bg: 'surface.purple', color: 'surface.purple.fg'},
      red: {bg: 'surface.red', color: 'surface.red.fg'},
      teal: {bg: 'surface.teal', color: 'surface.teal.fg'},
      yellow: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'neutral',
  },
});

export type BadgeVariants = RecipeVariantProps<typeof badgeRecipe>;
