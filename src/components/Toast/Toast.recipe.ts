import {sva, type RecipeVariantProps} from 'styled-system/css';

export const toastRecipe = sva({
  slots: ['root', 'inner', 'content', 'end'],
  base: {
    root: {
      width: '25rem',
      maxW: 'calc(100vw - 32px)',
      p: '4',
      borderRadius: 'lg',
      boxShadow: 'xl',
      fontFamily: 'body',
      transitionProperty: 'opacity, transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      '@starting-style': {
        opacity: 0,
        transform: 'translateY(8px)',
      },
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01ms',
      },
    },
    inner: {
      display: 'flex',
      alignItems: 'center',
      gap: '3',
    },
    content: {
      flex: 1,
      minW: 0,
    },
    end: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flexShrink: 0,
    },
  },
  variants: {
    type: {
      info: {root: {bg: 'status.info.solid', color: 'status.info.solidFg'}},
      error: {root: {bg: 'status.error.solid', color: 'status.error.solidFg'}},
      success: {
        root: {bg: 'status.success.solid', color: 'status.success.solidFg'},
      },
      warning: {
        root: {bg: 'status.warning.solid', color: 'status.warning.solidFg'},
      },
    },
    isExiting: {
      true: {
        root: {
          opacity: 0,
          transform: 'translateY(-8px)',
        },
      },
    },
  },
  defaultVariants: {
    type: 'info',
    isExiting: false,
  },
});

export type ToastVariants = RecipeVariantProps<typeof toastRecipe>;
