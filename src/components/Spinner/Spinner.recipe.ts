import {cva, type RecipeVariantProps} from 'styled-system/css';

export const spinnerRecipe = cva({
  base: {
    '--spinner-size': 'var(--silver-sizes-icon-md)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    verticalAlign: 'middle',
    color: 'primary',
    w: 'var(--spinner-size)',
    h: 'var(--spinner-size)',
  },
  variants: {
    size: {
      sm: {
        '--spinner-size': 'var(--silver-sizes-icon-sm)',
      },
      md: {
        '--spinner-size': 'var(--silver-sizes-icon-md)',
      },
      lg: {
        '--spinner-size': 'var(--silver-sizes-icon-lg)',
      },
      xl: {
        '--spinner-size': '2.25rem',
      },
    },
    variant: {
      default: {
        color: 'primary',
      },
      onMedia: {
        color: 'fg.onPrimary',
      },
    },
    hasLabel: {
      true: {
        flexDirection: 'column',
        gap: '2',
        w: 'auto',
        h: 'auto',
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    hasLabel: false,
  },
});

export type SpinnerVariants = RecipeVariantProps<typeof spinnerRecipe>;
