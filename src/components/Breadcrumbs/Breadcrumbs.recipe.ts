import {sva, type RecipeVariantProps} from 'styled-system/css';

export const breadcrumbsRecipe = sva({
  slots: ['nav', 'list'],
  base: {
    nav: {
      display: 'block',
    },
    list: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1',
      m: 0,
      p: 0,
      listStyle: 'none',
    },
  },
});

export type BreadcrumbsVariants = RecipeVariantProps<typeof breadcrumbsRecipe>;
