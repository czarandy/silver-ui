import {cva, type RecipeVariantProps} from 'styled-system/css';

export const bannerRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'body',
  },
});

export const bannerHeaderRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '2',
    py: '3',
    px: '4',
  },
  variants: {
    status: {
      info: {bg: 'blue.50'},
      warning: {bg: 'yellow.50'},
      error: {bg: 'red.50'},
      success: {bg: 'green.50'},
    },
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
  },
  compoundVariants: [
    {
      container: 'card',
      hasContent: false,
      css: {
        borderBottomRadius: 'lg',
      },
    },
  ],
  defaultVariants: {
    status: 'info',
    container: 'card',
    hasContent: false,
    isCentered: false,
  },
});

export type BannerVariants = RecipeVariantProps<typeof bannerRecipe>;
