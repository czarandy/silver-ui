import {sva, type RecipeVariantProps} from 'styled-system/css';

export const clickableRecipe = sva({
  slots: ['root', 'content'],
  base: {
    root: {
      display: 'inline-flex',
      appearance: 'none',
      alignItems: 'center',
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
    content: {
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
