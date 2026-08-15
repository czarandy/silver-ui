import {sva, type RecipeVariantProps} from 'styled-system/css';

export const selectableCardRecipe = sva({
  slots: ['content', 'indicator', 'body'],
  base: {
    content: {
      display: 'grid',
      gridTemplateColumns: 'auto minmax(0, 1fr)',
      alignItems: 'start',
      gap: '3',
    },
    indicator: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    body: {
      minW: 0,
    },
  },
});

export type SelectableCardVariants = RecipeVariantProps<
  typeof selectableCardRecipe
>;
