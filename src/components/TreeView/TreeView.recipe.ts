import {sva, type RecipeVariantProps} from 'styled-system/css';

export const treeViewRecipe = sva({
  slots: ['root', 'header', 'list'],
  base: {
    root: {
      position: 'relative',
    },
    header: {
      mb: '2',
    },
    list: {
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
  },
});

export type TreeViewVariants = RecipeVariantProps<typeof treeViewRecipe>;
