import {cva, type RecipeVariantProps} from 'styled-system/css';

export const buttonGroupRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'stretch',
    isolation: 'isolate',
    '& :where(button, a)': {
      position: 'relative',
    },
    '& :where(button, a):focus-visible': {
      zIndex: 1,
    },
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
        '& > :not(:first-child):is(button, a), & > :not(:first-child) :where(button, a)':
          {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderInlineStartWidth: '1px',
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: 'border',
          },
        '& > :not(:last-child):is(button, a), & > :not(:last-child) :where(button, a)':
          {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
      },
      vertical: {
        flexDirection: 'column',
        '& > :not(:first-child):is(button, a), & > :not(:first-child) :where(button, a)':
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBlockStartWidth: '1px',
            borderBlockStartStyle: 'solid',
            borderBlockStartColor: 'border',
          },
        '& > :not(:last-child):is(button, a), & > :not(:last-child) :where(button, a)':
          {
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
