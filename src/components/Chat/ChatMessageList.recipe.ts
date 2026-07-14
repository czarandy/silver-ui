import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatMessageListRecipe = sva({
  slots: ['root', 'inner', 'spacer', 'loadingTop', 'emptyState'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minH: 0,
    },
    inner: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minH: 0,
    },
    spacer: {
      flex: 1,
      minH: 0,
    },
    loadingTop: {
      display: 'flex',
      justifyContent: 'center',
      paddingBlock: '3',
    },
    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minH: 0,
    },
  },
  variants: {
    density: {
      compact: {
        inner: {gap: '2', paddingBlock: '2', paddingInline: '3'},
      },
      balanced: {
        inner: {gap: '4', paddingBlock: '4', paddingInline: '4'},
      },
      spacious: {
        inner: {gap: '6', paddingBlock: '6', paddingInline: '6'},
      },
    },
    gap: {
      0: {inner: {gap: '0'}},
      0.5: {inner: {gap: '0.5'}},
      1: {inner: {gap: '1'}},
      1.5: {inner: {gap: '1.5'}},
      2: {inner: {gap: '2'}},
      3: {inner: {gap: '3'}},
      4: {inner: {gap: '4'}},
      5: {inner: {gap: '5'}},
      6: {inner: {gap: '6'}},
      8: {inner: {gap: '8'}},
      10: {inner: {gap: '10'}},
    },
  },
  defaultVariants: {
    density: 'balanced',
  },
});

export type ChatMessageListVariants = RecipeVariantProps<
  typeof chatMessageListRecipe
>;
