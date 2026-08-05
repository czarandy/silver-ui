import {cva, type RecipeVariantProps} from 'styled-system/css';

export const checkboxGroupRecipe = cva({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      vertical: {
        flexDirection: 'column',
        gap: '2',
      },
      horizontal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '4',
        rowGap: '2',
      },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type CheckboxGroupVariants = RecipeVariantProps<
  typeof checkboxGroupRecipe
>;
