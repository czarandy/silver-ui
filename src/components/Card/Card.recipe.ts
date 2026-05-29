import {cva, type RecipeVariantProps} from 'styled-system/css';

export const cardRecipe = cva({
  base: {
    borderRadius: 'lg',
    overflow: 'clip',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
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
    padding: {
      0: {p: '0'},
      0.5: {p: '0.5'},
      1: {p: '1'},
      1.5: {p: '1.5'},
      2: {p: '2'},
      3: {p: '3'},
      4: {p: '4'},
      5: {p: '5'},
      6: {p: '6'},
      8: {p: '8'},
      10: {p: '10'},
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
    padding: 0,
    hasFixedHeight: false,
  },
});

export type CardVariants = RecipeVariantProps<typeof cardRecipe>;
