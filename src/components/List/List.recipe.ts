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
      true: {list: {gap: 0, '& > li': {py: '0.5'}}},
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
    // Anchor the glyph to the label's first-line BASELINE, the way native
    // `::marker` bullets work. A zero-width-space strut with the label's own
    // typography (md, 1.5) gives the container a real text baseline; the
    // container baseline-aligns with the label and the glyph sits a fixed
    // distance above that baseline. Centering on the line box instead reads
    // wrong on platforms whose fonts seat ink low in the line (Segoe UI), and
    // any sizing from the ambient font breaks inside e.g. an Alert
    // description, where the inherited size is `sm`.
    markerContainer: {
      alignSelf: 'baseline',
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      flexShrink: 0,
      w: '4',
      fontSize: 'md',
      lineHeight: '1.5',
      _before: {content: '"\\200B"'},
    },
    // Bottom edge on the baseline, nudged so the glyph centers 0.35em above
    // it — matching where fonts draw their own bullet glyphs (calibrated
    // against Chromium's native `::marker` rendering of the same text).
    dot: {
      w: markerSize,
      h: markerSize,
      borderRadius: 'full',
      bg: 'currentcolor',
      transform: `translateY(calc(${markerSize} / 2 - 0.35em))`,
    },
    circle: {
      w: markerSize,
      h: markerSize,
      borderRadius: 'full',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'currentcolor',
      bg: 'transparent',
      transform: `translateY(calc(${markerSize} / 2 - 0.35em))`,
    },
    number: {
      alignSelf: 'baseline',
      flexShrink: 0,
      color: 'inherit',
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
    isSelected: {
      true: {
        item: {
          bg: 'bg.hover',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    hasCounter: false,
    hasDividers: false,
    isSelected: false,
  },
});

export type ListItemVariants = RecipeVariantProps<typeof listItemRecipe>;
