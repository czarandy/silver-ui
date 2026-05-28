import {cva, type RecipeVariantProps} from 'styled-system/css';

export const avatarGroupRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    verticalAlign: 'middle',
  },
});

export type AvatarGroupVariants = RecipeVariantProps<typeof avatarGroupRecipe>;
