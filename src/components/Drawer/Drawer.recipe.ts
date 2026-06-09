import {sva, type RecipeVariantProps} from 'styled-system/css';

export const drawerRecipe = sva({
  slots: ['root', 'inner'],
  base: {
    root: {
      position: 'fixed',
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
    placement: {
      start: {
        root: {
          inset: 0,
          marginInlineEnd: 'auto',
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
          inset: 0,
          marginInlineStart: 'auto',
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
          inset: 0,
          mb: 'auto',
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
          inset: 0,
          mt: 'auto',
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
