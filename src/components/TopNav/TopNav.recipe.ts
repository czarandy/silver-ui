import {sva, type RecipeVariantProps} from 'styled-system/css';

export const topNavRecipe = sva({
  slots: [
    'root',
    'leftSection',
    'heading',
    'startContent',
    'centerContent',
    'rightSection',
    'endContent',
    'mobileEnd',
    'drawerItems',
    'drawerDivider',
  ],
  base: {
    root: {
      alignItems: 'center',
      w: '100%',
      p: '2',
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '4',
      flex: '1 1 0%',
      minW: 0,
    },
    heading: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    startContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    centerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '1',
    },
    endContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      flexShrink: 0,
      ms: 'auto',
    },
    mobileEnd: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      ms: 'auto',
    },
    drawerItems: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
    },
    drawerDivider: {
      my: '2',
    },
  },
  variants: {
    layout: {
      flex: {
        root: {display: 'flex'},
      },
      grid: {
        root: {display: 'grid', gridTemplateColumns: '1fr auto 1fr'},
      },
      mobile: {
        root: {display: 'flex'},
      },
    },
  },
  defaultVariants: {
    layout: 'flex',
  },
});

export type TopNavVariants = RecipeVariantProps<typeof topNavRecipe>;
