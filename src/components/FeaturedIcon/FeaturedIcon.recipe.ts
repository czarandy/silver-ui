import {cva, type RecipeVariantProps} from 'styled-system/css';

export const featuredIconRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 'full',
  },
  variants: {
    // Shares the control height scale so an `sm` featured icon lines up with
    // `sm` buttons and inputs.
    size: {
      sm: {w: 'component.sm', h: 'component.sm'},
      md: {w: 'component.md', h: 'component.md'},
      lg: {w: 'component.lg', h: 'component.lg'},
    },
    // Each tint pairs with its `surface.*.fg` foreground, which is AA-checked
    // in both modes (see tokens/contrast.test.ts). Semantic colors alias the
    // matching hue.
    color: {
      accent: {bg: 'primary.subtle', color: 'primary.active'},
      success: {bg: 'surface.green', color: 'surface.green.fg'},
      error: {bg: 'surface.red', color: 'surface.red.fg'},
      warning: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
      info: {bg: 'surface.blue', color: 'surface.blue.fg'},
      blue: {bg: 'surface.blue', color: 'surface.blue.fg'},
      cyan: {bg: 'surface.cyan', color: 'surface.cyan.fg'},
      gray: {bg: 'surface.gray', color: 'surface.gray.fg'},
      green: {bg: 'surface.green', color: 'surface.green.fg'},
      orange: {bg: 'surface.orange', color: 'surface.orange.fg'},
      pink: {bg: 'surface.pink', color: 'surface.pink.fg'},
      purple: {bg: 'surface.purple', color: 'surface.purple.fg'},
      red: {bg: 'surface.red', color: 'surface.red.fg'},
      teal: {bg: 'surface.teal', color: 'surface.teal.fg'},
      yellow: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
    },
    // Internal: NavIcon renders the solid primary treatment. Declared after
    // `color` so its fill and foreground take precedence.
    variant: {
      light: {},
      solid: {bg: 'primary', color: 'fg.onPrimary'},
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'accent',
    variant: 'light',
  },
});

export type FeaturedIconVariants = RecipeVariantProps<
  typeof featuredIconRecipe
>;
