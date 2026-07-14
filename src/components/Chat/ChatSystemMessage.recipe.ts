import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatSystemMessageRecipe = sva({
  slots: ['root', 'content', 'icon', 'dividerWrap'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2',
      paddingBlock: '1',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'normal',
      color: 'fg.muted',
      textAlign: 'center',
    },
    content: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1.5',
      flexShrink: 0,
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    dividerWrap: {
      w: '100%',
    },
  },
  variants: {
    variant: {
      default: {},
      divider: {},
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type ChatSystemMessageVariants = RecipeVariantProps<
  typeof chatSystemMessageRecipe
>;
