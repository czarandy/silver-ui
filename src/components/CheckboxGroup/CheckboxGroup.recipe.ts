import {cva, type RecipeVariantProps} from 'styled-system/css';

const gapVariants = {
  vertical: {gap: '0.5'},
  horizontal: {columnGap: '4', rowGap: '0'},
  0: {gap: '0'},
  0.5: {gap: '0.5'},
  1: {gap: '1'},
  1.5: {gap: '1.5'},
  2: {gap: '2'},
  3: {gap: '3'},
  4: {gap: '4'},
  5: {gap: '5'},
  6: {gap: '6'},
  8: {gap: '8'},
  10: {gap: '10'},
};

export const checkboxGroupRecipe = cva({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      vertical: {
        flexDirection: 'column',
      },
      horizontal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
      },
    },
    gap: gapVariants,
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type CheckboxGroupVariants = RecipeVariantProps<
  typeof checkboxGroupRecipe
>;
