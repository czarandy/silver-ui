import {sva, type RecipeVariantProps} from 'styled-system/css';

export const avatarRecipe = sva({
  slots: ['root', 'content', 'image', 'fallback', 'status'],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      flexShrink: 0,
      verticalAlign: 'middle',
      borderRadius: 'full',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 'full',
      overflow: 'hidden',
      userSelect: 'none',
      bg: 'bg.subtle',
      color: 'fg.muted',
    },
    image: {
      w: '100%',
      h: '100%',
      objectFit: 'cover',
    },
    fallback: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '100%',
      h: '100%',
      bg: 'bg.subtle',
      color: 'fg.muted',
      fontFamily: 'body',
      fontWeight: 'medium',
      textTransform: 'uppercase',
    },
    status: {
      position: 'absolute',
    },
  },
  variants: {
    isGrouped: {
      true: {
        root: {
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
      },
      false: {},
    },
  },
  defaultVariants: {
    isGrouped: false,
  },
});

export type AvatarVariants = RecipeVariantProps<typeof avatarRecipe>;
