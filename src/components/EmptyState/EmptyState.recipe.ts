import {sva, type RecipeVariantProps} from 'styled-system/css';

export const emptyStateRecipe = sva({
  slots: ['root', 'illustration', 'text', 'actions'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      gap: '2',
      w: 'full',
      px: '6',
      py: '8',
    },
    illustration: {
      display: 'inline-flex',
      color: 'fg.muted',
      w: '12',
      h: '12',
      '& > svg': {
        w: 'full',
        h: 'full',
      },
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1',
      maxW: '420px',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: '2',
      mt: '1',
    },
  },
  variants: {
    isCompact: {
      true: {
        root: {
          gap: '2',
          px: '4',
          py: '4',
        },
        actions: {
          mt: '0',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isCompact: false,
  },
});

export type EmptyStateVariants = RecipeVariantProps<typeof emptyStateRecipe>;
