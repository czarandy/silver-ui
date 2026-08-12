import {sva, type RecipeVariantProps} from 'styled-system/css';

export const clickableRecipe = sva({
  slots: ['root', 'overlay', 'content'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      appearance: 'none',
      alignItems: 'center',
      isolation: 'isolate',
      p: 0,
      borderWidth: 0,
      bg: 'transparent',
      color: 'inherit',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
      textAlign: 'inherit',
      textDecoration: 'none',
      borderRadius: 'inherit',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transitionProperty: 'background-color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
    content: {
      position: 'relative',
      zIndex: 1,
      display: 'inline-flex',
      alignItems: 'inherit',
      borderRadius: 'inherit',
    },
  },
  variants: {
    isInteractive: {
      true: {
        root: {
          cursor: 'pointer',
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
          '&:not([aria-disabled="true"]):hover > [data-clickable-overlay]': {
            bg: 'bg.ghost.hover',
          },
          '&:not([aria-disabled="true"]):active > [data-clickable-overlay]': {
            bg: 'bg.ghost.active',
          },
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        root: {cursor: 'not-allowed'},
        content: {opacity: 0.5},
      },
      false: {},
    },
  },
  defaultVariants: {
    isInteractive: false,
    isDisabled: false,
  },
});

export type ClickableVariants = RecipeVariantProps<typeof clickableRecipe>;
