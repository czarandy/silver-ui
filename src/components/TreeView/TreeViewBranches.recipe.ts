import {sva, type RecipeVariantProps} from 'styled-system/css';

export const treeViewBranchesRecipe = sva({
  slots: ['container', 'line'],
  base: {
    container: {
      position: 'absolute',
      h: 'full',
      w: '5',
    },
    line: {
      position: 'absolute',
      insetInline: 0,
      m: 'auto',
      w: '1px',
      h: 'calc(100% + 1px)',
      borderRadius: 'xs',
      bg: 'border.emphasized',
    },
  },
});

export type TreeViewBranchesVariants = RecipeVariantProps<
  typeof treeViewBranchesRecipe
>;
