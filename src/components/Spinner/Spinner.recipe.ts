import {sva, type RecipeVariantProps} from 'styled-system/css';

export const spinnerRecipe = sva({
  slots: ['root', 'visual', 'text'],
  base: {
    root: {
      '--spinner-size': 'var(--silver-sizes-icon-md)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      verticalAlign: 'middle',
      color: 'primary',
      w: 'var(--spinner-size)',
      h: 'var(--spinner-size)',
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5',
      textAlign: 'center',
    },
    visual: {
      display: 'block',
      w: 'var(--spinner-size)',
      h: 'var(--spinner-size)',
      flexShrink: 0,
      aspectRatio: 'square',
      borderRadius: 'full',
      borderWidth: 'emphasized',
      borderStyle: 'solid',
      borderColor: 'currentColor',
      borderTopColor: 'transparent',
      animation: 'spin 0.8s linear infinite',
      '@media (prefers-reduced-motion: reduce)': {
        animation: 'none',
      },
    },
  },
  variants: {
    size: {
      sm: {
        root: {'--spinner-size': 'var(--silver-sizes-icon-sm)'},
      },
      md: {
        root: {'--spinner-size': 'var(--silver-sizes-icon-md)'},
      },
      lg: {
        root: {'--spinner-size': 'var(--silver-sizes-icon-lg)'},
      },
      xl: {
        root: {'--spinner-size': '2.25rem'},
      },
    },
    variant: {
      default: {root: {color: 'primary'}},
      onMedia: {root: {color: 'fg.onPrimary'}},
    },
    hasText: {
      true: {
        root: {
          flexDirection: 'column',
          gap: '2',
          w: 'auto',
          h: 'auto',
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
    hasText: false,
  },
});

export type SpinnerVariants = RecipeVariantProps<typeof spinnerRecipe>;
