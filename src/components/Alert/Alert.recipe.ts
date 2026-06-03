import {cva, type RecipeVariantProps} from 'styled-system/css';

export const alertRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'body',
  },
});

export const alertHeaderRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2',
    px: '4',
    py: '3',
  },
  variants: {
    container: {
      card: {
        borderTopRadius: 'lg',
      },
      section: {},
    },
    hasContent: {
      true: {},
      false: {},
    },
    isCentered: {
      true: {
        alignItems: 'center',
      },
      false: {},
    },
    status: {
      error: {
        bg: 'surface.red',
        color: 'surface.red.fg',
        '--silver-text-color': 'token(colors.surface.red.fg)',
        '--silver-text-color-muted': 'token(colors.surface.red.fg)',
      },
      info: {
        bg: 'surface.blue',
        color: 'surface.blue.fg',
        '--silver-text-color': 'token(colors.surface.blue.fg)',
        '--silver-text-color-muted': 'token(colors.surface.blue.fg)',
      },
      success: {
        bg: 'surface.green',
        color: 'surface.green.fg',
        '--silver-text-color': 'token(colors.surface.green.fg)',
        '--silver-text-color-muted': 'token(colors.surface.green.fg)',
      },
      warning: {
        bg: 'surface.yellow',
        color: 'surface.yellow.fg',
        '--silver-text-color': 'token(colors.surface.yellow.fg)',
        '--silver-text-color-muted': 'token(colors.surface.yellow.fg)',
      },
    },
  },
  compoundVariants: [
    {
      container: 'card',
      css: {
        borderBottomRadius: 'lg',
      },
      hasContent: false,
    },
  ],
  defaultVariants: {
    container: 'card',
    hasContent: false,
    isCentered: false,
    status: 'info',
  },
});

export type AlertVariants = RecipeVariantProps<typeof alertRecipe>;
