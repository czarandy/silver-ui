import {sva, type RecipeVariantProps} from 'styled-system/css';

export const blockquoteRecipe = sva({
  slots: ['root', 'cite'],
  base: {
    root: {
      borderInlineStartWidth: 'emphasized',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'border.emphasized',
      ps: '4',
      color: 'fg.muted',
      m: 0,
    },
    cite: {
      display: 'block',
      mt: '2',
      fontSize: 'sm',
      lineHeight: 'normal',
      fontStyle: 'normal',
    },
  },
});

export type BlockquoteVariants = RecipeVariantProps<typeof blockquoteRecipe>;
