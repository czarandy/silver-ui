import {inheritanceReset} from 'internal/inheritanceReset';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const drawerRecipe = sva({
  slots: ['root', 'inner'],
  base: {
    root: {
      position: 'fixed',
      m: 0,
      p: 0,
      borderWidth: 0,
      bg: 'bg',
      color: 'fg',
      boxShadow: 'xl',
      flexDirection: 'column',
      overscrollBehavior: 'contain',
      ...inheritanceReset,
      // Individual translate property (not the transform shorthand), so the
      // steady open state authors nothing and the inline `size` style never
      // collides with the slide.
      transitionProperty: 'translate',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
      _backdrop: {
        bg: 'overlay.scrim',
        backdropFilter: 'blur(2px)',
        transitionProperty: 'opacity',
        transitionDuration: 'normal',
        transitionTimingFunction: 'default',
        '@media (prefers-reduced-motion: reduce)': {
          transitionDuration: '0.01s',
        },
      },
      _focusVisible: {
        outline: 'none',
      },
    },
    inner: {
      display: 'flex',
      flexDirection: 'column',
      flex: '1 1 auto',
      h: '100%',
      minH: 0,
      overflow: 'hidden',
    },
  },
  variants: {
    // open: rendered, sliding in from the placement edge via @starting-style.
    // closing: the drawer still has [open] while the deferred close() waits
    // for the slide-out; display stays flex only under [open] so a closed
    // drawer can never be pinned visible (see useKeyboardHint.recipe.ts).
    // closed: author nothing; the native <dialog> UA style (display: none)
    // applies.
    state: {
      open: {
        root: {
          display: 'flex',
          '@starting-style': {
            translate: 'var(--drawer-hidden-translate)',
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
          translate: 'var(--drawer-hidden-translate)',
          _backdrop: {
            opacity: 0,
          },
        },
      },
      closed: {},
    },
    // Set both logical edges directly instead of aligning an `inset: 0`
    // dialog with auto margins, which a host application's reset can flatten.
    // Each placement also defines its off-screen translate; percentages
    // resolve against the drawer's own size, so any `size` value slides fully
    // off-edge.
    placement: {
      start: {
        root: {
          insetBlock: 0,
          insetInlineStart: 0,
          insetInlineEnd: 'auto',
          h: '100dvh',
          maxH: '100dvh',
          borderRadius: 0,
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
          '--drawer-hidden-translate': '-100% 0',
          _rtl: {
            '--drawer-hidden-translate': '100% 0',
          },
        },
      },
      end: {
        root: {
          insetBlock: 0,
          insetInlineStart: 'auto',
          insetInlineEnd: 0,
          h: '100dvh',
          maxH: '100dvh',
          borderRadius: 0,
          borderInlineStartWidth: 'default',
          borderInlineStartStyle: 'solid',
          borderInlineStartColor: 'border',
          '--drawer-hidden-translate': '100% 0',
          _rtl: {
            '--drawer-hidden-translate': '-100% 0',
          },
        },
      },
      top: {
        root: {
          insetBlockStart: 0,
          insetBlockEnd: 'auto',
          insetInline: 0,
          w: '100dvw',
          maxW: '100dvw',
          borderRadius: 0,
          borderBlockEndWidth: 'default',
          borderBlockEndStyle: 'solid',
          borderBlockEndColor: 'border',
          '--drawer-hidden-translate': '0 -100%',
        },
      },
      bottom: {
        root: {
          insetBlockStart: 'auto',
          insetBlockEnd: 0,
          insetInline: 0,
          w: '100dvw',
          maxW: '100dvw',
          borderRadius: 0,
          borderBlockStartWidth: 'default',
          borderBlockStartStyle: 'solid',
          borderBlockStartColor: 'border',
          '--drawer-hidden-translate': '0 100%',
        },
      },
    },
  },
  defaultVariants: {
    state: 'closed',
    placement: 'end',
  },
});

export type DrawerVariants = RecipeVariantProps<typeof drawerRecipe>;
