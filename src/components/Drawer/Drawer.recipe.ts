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
      _backdrop: {
        bg: 'overlay.scrim',
        backdropFilter: 'blur(2px)',
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
    // When closed, the native <dialog> UA style (display: none) applies; opening
    // switches on the flex column layout.
    isOpen: {
      true: {root: {display: 'flex'}},
      false: {},
    },
    // Set both logical edges directly instead of aligning an `inset: 0`
    // dialog with auto margins, which a host application's reset can flatten.
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
        },
      },
    },
  },
  defaultVariants: {
    isOpen: false,
    placement: 'end',
  },
});

export type DrawerVariants = RecipeVariantProps<typeof drawerRecipe>;
