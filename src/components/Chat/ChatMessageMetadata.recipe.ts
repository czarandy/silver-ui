import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatMessageMetadataRecipe = sva({
  slots: ['root', 'status'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      mt: '1',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'normal',
      color: 'fg.muted',
    },
    status: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
    },
  },
  variants: {
    sender: {
      assistant: {root: {flexDirection: 'row'}},
      system: {root: {flexDirection: 'row'}},
      user: {root: {flexDirection: 'row-reverse'}},
    },
    status: {
      delivered: {},
      error: {status: {color: 'status.error.fg'}},
      read: {},
      sending: {
        status: {
          animation: 'chat-pulse 1.5s ease-in-out infinite',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
          },
        },
      },
      sent: {},
    },
  },
  defaultVariants: {
    sender: 'assistant',
  },
});

export type ChatMessageMetadataVariants = RecipeVariantProps<
  typeof chatMessageMetadataRecipe
>;
