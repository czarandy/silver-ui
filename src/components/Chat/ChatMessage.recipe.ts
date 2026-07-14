import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatMessageRecipe = sva({
  slots: ['root', 'avatar', 'content', 'name', 'body'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'flex-start',
      maxW: '100%',
    },
    avatar: {
      flexShrink: 0,
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minW: 0,
    },
    name: {
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'semibold',
      color: 'fg.muted',
      mb: '1',
    },
    body: {
      display: 'flex',
      flexDirection: 'column',
      minW: 0,
      w: '100%',
    },
  },
  variants: {
    sender: {
      assistant: {
        root: {flexDirection: 'row', justifyContent: 'flex-start'},
        content: {alignItems: 'flex-start'},
        body: {alignItems: 'flex-start'},
      },
      system: {
        root: {flexDirection: 'row', justifyContent: 'center'},
        content: {alignItems: 'center', maxW: '90%'},
        body: {alignItems: 'center'},
      },
      user: {
        root: {flexDirection: 'row-reverse', justifyContent: 'flex-start'},
        content: {alignItems: 'flex-end'},
        body: {alignItems: 'flex-end'},
      },
    },
    density: {
      compact: {
        root: {gap: '1.5'},
        body: {gap: '0.5'},
      },
      balanced: {
        root: {gap: '2'},
        body: {gap: '1'},
      },
      spacious: {
        root: {gap: '3'},
        body: {gap: '1.5'},
      },
    },
  },
  defaultVariants: {
    sender: 'assistant',
    density: 'balanced',
  },
});

export type ChatMessageVariants = RecipeVariantProps<typeof chatMessageRecipe>;
