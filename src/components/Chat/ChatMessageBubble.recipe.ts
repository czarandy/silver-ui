import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatMessageBubbleRecipe = sva({
  slots: ['nameRow', 'bubble', 'metadataRow'],
  base: {
    nameRow: {
      display: 'flex',
      alignItems: 'center',
      h: '5',
      mb: '-1.5',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'semibold',
      color: 'fg.muted',
    },
    bubble: {
      display: 'flex',
      flexDirection: 'column',
      maxW: 'max(80%, 280px)',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'normal',
      overflowWrap: 'break-word',
      wordBreak: 'break-word',
    },
    metadataRow: {
      mt: '-1.5',
    },
  },
  variants: {
    variant: {
      filled: {
        bubble: {bg: 'bg.subtle', color: 'fg'},
      },
      ghost: {
        bubble: {bg: 'transparent', color: 'fg', paddingBlock: 0},
      },
    },
    // Block padding is density-dependent but must stay zero for the ghost
    // variant, so it lives in compoundVariants below.
    density: {
      compact: {
        nameRow: {px: '4'},
        bubble: {borderRadius: 'xl', paddingInline: '4'},
        metadataRow: {px: '4'},
      },
      balanced: {
        nameRow: {px: '4'},
        bubble: {borderRadius: '2xl', paddingInline: '4'},
        metadataRow: {px: '4'},
      },
      spacious: {
        nameRow: {px: '5'},
        bubble: {borderRadius: '2xl', paddingInline: '5'},
        metadataRow: {px: '5'},
      },
    },
    sender: {
      assistant: {},
      system: {},
      user: {
        nameRow: {justifyContent: 'flex-end', textAlign: 'end'},
        metadataRow: {textAlign: 'end'},
      },
    },
    // Marker variants; the corner tightening depends on the sender side, so
    // it lives in compoundVariants below.
    group: {
      first: {},
      middle: {},
      last: {},
    },
  },
  compoundVariants: [
    {
      variant: 'filled',
      density: 'compact',
      css: {bubble: {paddingBlock: '3'}},
    },
    {
      variant: 'filled',
      density: 'balanced',
      css: {bubble: {paddingBlock: '3'}},
    },
    {
      variant: 'filled',
      density: 'spacious',
      css: {bubble: {paddingBlock: '4'}},
    },
    {
      sender: 'assistant',
      group: 'first',
      css: {bubble: {borderBottomLeftRadius: 'md'}},
    },
    {
      sender: 'assistant',
      group: 'middle',
      css: {
        bubble: {borderTopLeftRadius: 'md', borderBottomLeftRadius: 'md'},
      },
    },
    {
      sender: 'assistant',
      group: 'last',
      css: {bubble: {borderTopLeftRadius: 'md'}},
    },
    {
      sender: 'user',
      group: 'first',
      css: {bubble: {borderBottomRightRadius: 'md'}},
    },
    {
      sender: 'user',
      group: 'middle',
      css: {
        bubble: {borderTopRightRadius: 'md', borderBottomRightRadius: 'md'},
      },
    },
    {
      sender: 'user',
      group: 'last',
      css: {bubble: {borderTopRightRadius: 'md'}},
    },
  ],
  defaultVariants: {
    variant: 'filled',
    density: 'balanced',
    sender: 'assistant',
  },
});

export type ChatMessageBubbleVariants = RecipeVariantProps<
  typeof chatMessageBubbleRecipe
>;
