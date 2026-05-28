import {cva, type RecipeVariantProps} from 'styled-system/css';

export const dialogRecipe = cva({
  base: {
    position: 'fixed',
    m: 'auto',
    p: 0,
    borderWidth: 0,
    bg: 'bg',
    color: 'fg',
    borderRadius: 'lg',
    boxShadow: 'lg',
    display: 'none',
    flexDirection: 'column',
    h: 'fit-content',
    maxW: 'min(90vw, var(--dialog-width))',
    maxH: 'var(--dialog-max-height)',
    w: 'var(--dialog-width)',
    overflow: 'hidden',
    overscrollBehavior: 'contain',
    opacity: 0,
    '&::backdrop': {
      bg: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(2px)',
    },
    _focusVisible: {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'accent',
      outlineOffset: '2px',
    },
  },
  variants: {
    isOpen: {
      true: {
        display: 'flex',
        opacity: 1,
      },
      false: {},
    },
    variant: {
      standard: {},
      fullscreen: {
        inset: 0,
        m: 0,
        borderRadius: 0,
        maxW: '100dvw',
        maxH: '100dvh',
        w: '100dvw',
        h: '100dvh',
      },
    },
  },
  defaultVariants: {
    isOpen: false,
    variant: 'standard',
  },
});

export type DialogVariants = RecipeVariantProps<typeof dialogRecipe>;
