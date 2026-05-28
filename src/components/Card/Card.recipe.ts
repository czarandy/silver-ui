import {cva, type RecipeVariantProps} from 'styled-system/css';

export const cardRecipe = cva({
  base: {
    borderRadius: 'lg',
    overflow: 'clip',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    p: 'var(--card-padding)',
  },
  variants: {
    variant: {
      default: {
        bg: 'bg',
        borderColor: 'border',
      },
      transparent: {
        bg: 'transparent',
      },
      muted: {
        bg: 'bg.subtle',
      },
      blue: {bg: 'blue.50'},
      cyan: {bg: 'cyan.50'},
      gray: {bg: 'silver-neutral.50'},
      green: {bg: 'green.50'},
      orange: {bg: 'orange.50'},
      pink: {bg: 'pink.50'},
      purple: {bg: 'purple.50'},
      red: {bg: 'red.50'},
      teal: {bg: 'teal.50'},
      yellow: {bg: 'yellow.50'},
    },
    hasFixedHeight: {
      true: {
        overflow: 'auto',
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'default',
    hasFixedHeight: false,
  },
});

export type CardVariants = RecipeVariantProps<typeof cardRecipe>;
