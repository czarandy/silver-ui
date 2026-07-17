import {sva, type RecipeVariantProps} from 'styled-system/css';

export const toastRecipe = sva({
  slots: ['root', 'inner', 'content', 'end'],
  base: {
    root: {
      // A toast is already the loud element, and every type is a solid status
      // fill, so a `primary` action inside one collapses to the same treatment
      // the dismiss button uses. Left alone it would paint the global accent on
      // a fill it was never picked against — teal on teal for `info`.
      //
      // These mirror Button's own `onSolid` variant. `currentColor` resolves to
      // whichever `solidFg` the type sets, so no per-type values are needed:
      // the label follows the toast's text, white on the dark fills and dark on
      // the light `warning` one, exactly as the body copy does.
      '--silver-button-primary-bg': 'transparent',
      '--silver-button-primary-fg': 'currentColor',
      '--silver-button-primary-bg-hover':
        'color-mix(in srgb, currentColor 15%, transparent)',
      '--silver-button-primary-bg-active':
        'color-mix(in srgb, currentColor 20%, transparent)',
      '--silver-button-focus-color': 'currentColor',
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
