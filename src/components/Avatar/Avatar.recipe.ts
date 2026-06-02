import {cva, type RecipeVariantProps} from 'styled-system/css';

export const avatarRecipe = cva({
  base: {
    position: 'relative',
    display: 'inline-flex',
    flexShrink: 0,
    verticalAlign: 'middle',
    borderRadius: 'full',
  },
  variants: {
    isGrouped: {
      true: {
        borderRadius: 'full',
        borderWidth: 'emphasized',
        borderStyle: 'solid',
        borderColor: 'bg',
        bg: 'bg',
        boxSizing: 'content-box',
        '&:not(:first-child)': {
          marginInlineStart: 'var(--avatar-group-overlap)',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isGrouped: false,
  },
});

export type AvatarVariants = RecipeVariantProps<typeof avatarRecipe>;
