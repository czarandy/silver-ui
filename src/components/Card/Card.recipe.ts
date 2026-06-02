import {cva, type RecipeVariantProps} from 'styled-system/css';

export const cardRecipe = cva({
  base: {
    borderRadius: 'lg',
    borderWidth: 'default',
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
      blue: {bg: 'surface.blue'},
      cyan: {bg: 'surface.cyan'},
      gray: {bg: 'surface.gray'},
      green: {bg: 'surface.green'},
      orange: {bg: 'surface.orange'},
      pink: {bg: 'surface.pink'},
      purple: {bg: 'surface.purple'},
      red: {bg: 'surface.red'},
      teal: {bg: 'surface.teal'},
      yellow: {bg: 'surface.yellow'},
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
  },
  defaultVariants: {
    variant: 'default',
    padding: 0,
  },
});

export type CardVariants = RecipeVariantProps<typeof cardRecipe>;
