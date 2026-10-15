import {sva, type RecipeVariantProps} from 'styled-system/css';

const tint = (percent: number) =>
  `color-mix(in srgb, currentColor ${percent}%, transparent)`;
const ring = tint(60);

export const toastRecipe = sva({
  slots: ['root', 'inner', 'content', 'end'],
  base: {
    root: {
      // A toast is already the loud element, and every type is a solid status
      // fill, so the global accent and gray surfaces Button actions normally
      // use were never picked against it — teal on teal for `info`, a stray
      // gray chip for `secondary`. Actions are retinted from `currentColor`
      // instead, which resolves to whichever `solidFg` the type sets: white on
      // the dark fills and dark on the light `warning` one, exactly as the body
      // copy does, with no per-type values.
      //
      // The rank stays legible without a fill colour (none clears 3:1 against
      // both amber and teal): `primary` (and `outline`, which renders the same
      // here) gets a crisp ring, `secondary` a soft tint, and the dismiss
      // button stays ghost.
      '--silver-button-primary-bg': 'transparent',
      '--silver-button-primary-fg': 'currentColor',
      '--silver-button-primary-border': ring,
      '--silver-button-primary-bg-hover': tint(15),
      '--silver-button-primary-bg-active': tint(20),
      '--silver-button-outline-fg': 'currentColor',
      '--silver-button-outline-border': ring,
      '--silver-button-outline-bg-hover': tint(15),
      '--silver-button-outline-bg-active': tint(20),
      '--silver-button-secondary-bg': tint(15),
      '--silver-button-secondary-fg': 'currentColor',
      '--silver-button-secondary-bg-hover': tint(22),
      '--silver-button-secondary-bg-active': tint(28),
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
      // Set by ToastViewport for the one style pass after it moves its toasts
      // into or out of a modal dialog. A moved node restarts from
      // @starting-style, which would replay the entry for a toast already on
      // screen. The ancestor attribute also outranks the single-class rule
      // above regardless of stylesheet order.
      '[data-toast-skip-entry] &': {
        '@starting-style': {
          opacity: 1,
          transform: 'none',
        },
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
