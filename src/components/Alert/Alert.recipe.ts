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
      error: {bg: 'surface.red'},
      info: {bg: 'surface.blue'},
      success: {bg: 'surface.green'},
      warning: {bg: 'surface.yellow'},
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
