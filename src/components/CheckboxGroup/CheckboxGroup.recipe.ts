import {cva, type RecipeVariantProps} from 'styled-system/css';

export const checkboxGroupRecipe = cva({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      vertical: {
        flexDirection: 'column',
        gap: '0.5',
      },
      horizontal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '4',
        rowGap: '0',
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
