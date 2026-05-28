import {cva, type RecipeVariantProps} from 'styled-system/css';

export const buttonGroupRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'stretch',
    isolation: 'isolate',
    '& > :where(button, a)': {
      position: 'relative',
    },
    '& > :where(button, a):focus-visible': {
      zIndex: 1,
    },
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
        '& > :where(button, a):not(:first-child)': {
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        },
        '& > :where(button, a):not(:last-child)': {
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
      },
      vertical: {
        flexDirection: 'column',
        '& > :where(button, a):not(:first-child)': {
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        },
        '& > :where(button, a):not(:last-child)': {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type ButtonGroupVariants = RecipeVariantProps<typeof buttonGroupRecipe>;
