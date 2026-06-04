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
    // Each padding value also exposes `--card-padding` so descendants (e.g. a
    // full-bleed Divider) can offset the card's padding to reach its edges.
    padding: {
      0: {p: '0', '--card-padding': 'token(spacing.0)'},
      0.5: {p: '0.5', '--card-padding': 'token(spacing.0.5)'},
      1: {p: '1', '--card-padding': 'token(spacing.1)'},
      1.5: {p: '1.5', '--card-padding': 'token(spacing.1.5)'},
      2: {p: '2', '--card-padding': 'token(spacing.2)'},
      3: {p: '3', '--card-padding': 'token(spacing.3)'},
      4: {p: '4', '--card-padding': 'token(spacing.4)'},
      5: {p: '5', '--card-padding': 'token(spacing.5)'},
      6: {p: '6', '--card-padding': 'token(spacing.6)'},
      8: {p: '8', '--card-padding': 'token(spacing.8)'},
      10: {p: '10', '--card-padding': 'token(spacing.10)'},
    },
  },
  defaultVariants: {
    variant: 'default',
    padding: 0,
  },
});

export type CardVariants = RecipeVariantProps<typeof cardRecipe>;
