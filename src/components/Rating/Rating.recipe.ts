import {sva, type RecipeVariantProps} from 'styled-system/css';

export const ratingRecipe = sva({
  slots: ['root', 'star', 'input'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5',
    },
    star: {
      display: 'inline-flex',
      alignItems: 'center',
      cursor: 'pointer',
      p: 0,
      m: 0,
      borderWidth: 0,
      bg: 'transparent',
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
        borderRadius: 'sm',
      },
    },
    input: {
      position: 'absolute',
      w: '1px',
      h: '1px',
      p: 0,
      m: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
    },
  },
  variants: {
    isDisabled: {
      true: {
        root: {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
        star: {
          cursor: 'not-allowed',
        },
      },
    },
    isReadOnly: {
      true: {
        star: {
          cursor: 'default',
        },
      },
    },
  },
});

export type RatingVariants = RecipeVariantProps<typeof ratingRecipe>;
