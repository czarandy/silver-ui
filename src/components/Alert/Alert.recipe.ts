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
      error: {bg: 'red.100'},
      info: {bg: 'blue.100'},
      success: {bg: 'green.100'},
      warning: {bg: 'yellow.100'},
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
