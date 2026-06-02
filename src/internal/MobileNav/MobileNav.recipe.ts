import {cva, type RecipeVariantProps} from 'styled-system/css';

export const mobileNavRecipe = cva({
  base: {
    position: 'fixed',
    inset: 0,
    m: 0,
    p: 0,
    borderWidth: 0,
    maxW: 'none',
    maxH: 'none',
    w: '100vw',
    h: '100dvh',
    bg: 'transparent',
    overflow: 'hidden',
    display: 'none',
    '&::backdrop': {
      bg: 'overlay.scrim',
      backdropFilter: 'blur(2px)',
    },
  },
  variants: {
    isOpen: {
      true: {
        display: 'flex',
      },
      false: {},
    },
  },
  defaultVariants: {
    isOpen: false,
  },
});

export type MobileNavVariants = RecipeVariantProps<typeof mobileNavRecipe>;
