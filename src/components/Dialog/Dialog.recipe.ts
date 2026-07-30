import {inheritanceReset} from 'internal/inheritanceReset';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const dialogRecipe = sva({
  slots: ['root', 'inner'],
  base: {
    root: {
      position: 'fixed',
      inset: 0,
      m: 'auto',
      p: 0,
      borderWidth: 0,
      bg: 'bg',
      color: 'fg',
      borderRadius: 'md',
      boxShadow: 'xl',
      flexDirection: 'column',
      overscrollBehavior: 'contain',
      ...inheritanceReset,
      // Individual opacity/scale properties (not the transform shorthand), so
      // the steady open state authors nothing and cannot create a containing
      // block; browsers without individual-transform support skip the motion.
      transitionProperty: 'opacity, scale',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
      _backdrop: {
        bg: 'overlay.scrim',
        backdropFilter: 'blur(2px)',
        transitionProperty: 'opacity',
        transitionDuration: 'fast',
        transitionTimingFunction: 'default',
        '@media (prefers-reduced-motion: reduce)': {
          transitionDuration: '0.01s',
        },
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    inner: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      minH: 0,
      overflow: 'hidden',
      borderRadius: 'inherit',
    },
  },
  variants: {
    // open: rendered, with entry animated from the @starting-style values.
    // closing: the dialog still has [open] while the deferred close() waits for
    // the exit transition; display stays flex only under [open] so a closed
    // dialog can never be pinned visible (see useKeyboardHint.recipe.ts).
    // closed: author nothing; the native <dialog> UA style (display: none)
    // applies.
    state: {
      open: {
        root: {
          display: 'flex',
          '@starting-style': {
            opacity: 0,
            scale: '0.97',
          },
          _backdrop: {
            opacity: 1,
            '@starting-style': {
              opacity: 0,
            },
          },
        },
      },
      closing: {
        root: {
          '&[open]': {display: 'flex'},
          opacity: 0,
          scale: '0.97',
          _backdrop: {
            opacity: 0,
          },
        },
      },
      closed: {},
    },
    variant: {
      standard: {},
      fullscreen: {
        root: {
          w: '100dvw',
          h: '100dvh',
          maxW: '100dvw',
          maxH: '100dvh',
          borderRadius: 0,
          m: 0,
          inset: 0,
        },
      },
    },
  },
  defaultVariants: {
    state: 'closed',
    variant: 'standard',
  },
});

export type DialogVariants = RecipeVariantProps<typeof dialogRecipe>;
