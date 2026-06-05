import {sva, type RecipeVariantProps} from 'styled-system/css';

const markerSize = '6px';

export const listRecipe = sva({
  slots: ['root', 'header', 'list'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    header: {
      mb: '2',
    },
    list: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
  },
  variants: {
    hasDividers: {
      true: {list: {gap: 0}},
    },
    hasCounter: {
      true: {list: {counterReset: 'silver-list'}},
    },
  },
  defaultVariants: {
    hasDividers: false,
    hasCounter: false,
  },
});

export type ListVariants = RecipeVariantProps<typeof listRecipe>;

export const listItemRecipe = sva({
  slots: ['item', 'markerContainer', 'dot', 'circle', 'number'],
  base: {
    item: {},
    markerContainer: {
      alignSelf: 'baseline',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '4',
      mt: `calc((1em * 1.5 - ${markerSize}) / 2)`,
    },
    dot: {
      w: markerSize,
      h: markerSize,
      borderRadius: 'full',
      bg: 'fg',
    },
    circle: {
      w: markerSize,
      h: markerSize,
      borderRadius: 'full',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'fg',
      bg: 'transparent',
    },
    number: {
      alignSelf: 'baseline',
      flexShrink: 0,
      color: 'fg',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: '1.5',
      w: '4',
      _before: {
        content: 'counter(silver-list) "."',
      },
    },
  },
  variants: {
    hasCounter: {
      true: {
        item: {counterIncrement: 'silver-list'},
      },
    },
    hasDividers: {
      true: {
        item: {
          borderBlockEndWidth: 'default',
          borderBlockEndStyle: 'solid',
          borderBlockEndColor: 'border',
          borderRadius: 0,
          _last: {
            borderBlockEndWidth: 0,
          },
        },
      },
    },
  },
  defaultVariants: {
    hasCounter: false,
    hasDividers: false,
  },
});

export type ListItemVariants = RecipeVariantProps<typeof listItemRecipe>;
