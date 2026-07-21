import {cva, type RecipeVariantProps} from 'styled-system/css';

export const gridRecipe = cva({
  base: {
    display: 'grid',
  },
  variants: {
    gap: {
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
    },
    layout: {
      columns: {
        gridTemplateColumns: {
          base: 'repeat(var(--silver-grid-columns-base), minmax(0, 1fr))',
          sm: 'repeat(var(--silver-grid-columns-sm), minmax(0, 1fr))',
          md: 'repeat(var(--silver-grid-columns-md), minmax(0, 1fr))',
          lg: 'repeat(var(--silver-grid-columns-lg), minmax(0, 1fr))',
          xl: 'repeat(var(--silver-grid-columns-xl), minmax(0, 1fr))',
          '2xl': 'repeat(var(--silver-grid-columns-2xl), minmax(0, 1fr))',
        },
      },
      minChildWidth: {
        gridTemplateColumns:
          'repeat(auto-fit, minmax(var(--silver-grid-min-child-width), 1fr))',
      },
    },
  },
});

export type GridVariants = RecipeVariantProps<typeof gridRecipe>;
