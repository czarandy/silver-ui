import {cva, type RecipeVariantProps} from 'styled-system/css';

export const iconRecipe = cva({
  base: {
    display: 'inline-block',
    flexShrink: 0,
  },
  variants: {
    size: {
      sm: {
        w: 'icon.sm',
        h: 'icon.sm',
      },
      md: {
        w: 'icon.md',
        h: 'icon.md',
      },
      lg: {
        w: 'icon.lg',
        h: 'icon.lg',
      },
    },
    color: {
      primary: {color: 'icon.primary'},
      secondary: {color: 'icon.secondary'},
      tertiary: {color: 'icon.tertiary'},
      disabled: {color: 'icon.disabled'},
      accent: {color: 'icon.accent'},
      success: {color: 'icon.success'},
      error: {color: 'icon.error'},
      warning: {color: 'icon.warning'},
      inherit: {color: 'currentColor'},
      blue: {color: 'icon.blue'},
      red: {color: 'icon.red'},
      green: {color: 'icon.green'},
      gray: {color: 'icon.gray'},
      cyan: {color: 'icon.cyan'},
      teal: {color: 'icon.teal'},
      yellow: {color: 'icon.yellow'},
      orange: {color: 'icon.orange'},
      pink: {color: 'icon.pink'},
      purple: {color: 'icon.purple'},
    },
  },
  defaultVariants: {
    size: 'md',
    color: 'inherit',
  },
});

export type IconVariants = RecipeVariantProps<typeof iconRecipe>;
