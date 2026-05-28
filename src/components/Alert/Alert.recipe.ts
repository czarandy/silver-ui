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
      error: {bg: 'red.50'},
      info: {bg: 'blue.50'},
      success: {bg: 'green.50'},
      warning: {bg: 'yellow.50'},
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
