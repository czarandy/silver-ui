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
    // Marker lists (disc/circle/decimal) read as prose bullets, not as rows
    // of controls, so they drop most of Item's tap-target padding. The child
    // selector outranks Item's own atomic `py` class, which the recipes
    // would otherwise race on stylesheet order.
    hasMarkers: {
      true: {list: {'& > li': {py: '0.5'}}},
    },
  },
  defaultVariants: {
    hasDividers: false,
    hasCounter: false,
    hasMarkers: false,
  },
});

export type ListVariants = RecipeVariantProps<typeof listRecipe>;

export const listItemRecipe = sva({
  slots: ['item', 'markerContainer', 'dot', 'circle', 'number'],
  base: {
    item: {},
    // The container is exactly one label line tall (the label Text is md with
    // a 1.5 line height) with the glyph centered inside, and it pins to the
    // top of the item. Sizing must not lean on the ambient font: inside e.g.
    // an Alert description the inherited size is `sm`, which would place the
    // marker off the label's first-line center.
    markerContainer: {
      alignSelf: 'flex-start',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '4',
      fontSize: 'md',
      h: 'calc(1em * 1.5)',
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
