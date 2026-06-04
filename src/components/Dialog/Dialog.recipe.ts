import {sva, type RecipeVariantProps} from 'styled-system/css';

export const dialogRecipe = sva({
  slots: ['root', 'inner'],
  base: {
    root: {
      position: 'fixed',
      m: 'auto',
      p: 0,
      borderWidth: 0,
      bg: 'bg',
      color: 'fg',
      borderRadius: 'md',
      boxShadow: 'xl',
      flexDirection: 'column',
      overscrollBehavior: 'contain',
      _backdrop: {
        bg: 'overlay.scrim',
        backdropFilter: 'blur(2px)',
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
    // When closed, the native <dialog> UA style (display: none) applies; opening
    // switches on the flex column layout.
    isOpen: {
      true: {root: {display: 'flex'}},
      false: {},
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
    isOpen: false,
    variant: 'standard',
  },
});

export type DialogVariants = RecipeVariantProps<typeof dialogRecipe>;
