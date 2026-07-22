import {gapVariants, type SpacingToken} from 'internal/spacingTokens';
import {sva, type RecipeVariantProps} from 'styled-system/css';

// All four slots share one gap so the bar and its slots space uniformly; the
// values come from the shared `gapVariants` map and the `satisfies` clause
// keeps the keys in lockstep with `SpacingToken`.
const gapSlotVariants = {
  0: {
    root: gapVariants[0],
    start: gapVariants[0],
    center: gapVariants[0],
    end: gapVariants[0],
  },
  0.5: {
    root: gapVariants[0.5],
    start: gapVariants[0.5],
    center: gapVariants[0.5],
    end: gapVariants[0.5],
  },
  1: {
    root: gapVariants[1],
    start: gapVariants[1],
    center: gapVariants[1],
    end: gapVariants[1],
  },
  1.5: {
    root: gapVariants[1.5],
    start: gapVariants[1.5],
    center: gapVariants[1.5],
    end: gapVariants[1.5],
  },
  2: {
    root: gapVariants[2],
    start: gapVariants[2],
    center: gapVariants[2],
    end: gapVariants[2],
  },
  3: {
    root: gapVariants[3],
    start: gapVariants[3],
    center: gapVariants[3],
    end: gapVariants[3],
  },
  4: {
    root: gapVariants[4],
    start: gapVariants[4],
    center: gapVariants[4],
    end: gapVariants[4],
  },
  5: {
    root: gapVariants[5],
    start: gapVariants[5],
    center: gapVariants[5],
    end: gapVariants[5],
  },
  6: {
    root: gapVariants[6],
    start: gapVariants[6],
    center: gapVariants[6],
    end: gapVariants[6],
  },
  8: {
    root: gapVariants[8],
    start: gapVariants[8],
    center: gapVariants[8],
    end: gapVariants[8],
  },
  10: {
    root: gapVariants[10],
    start: gapVariants[10],
    center: gapVariants[10],
    end: gapVariants[10],
  },
} as const satisfies Record<SpacingToken, unknown>;

export const toolbarRecipe = sva({
  slots: ['root', 'start', 'center', 'end'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBlock: '2',
    },
    start: {
      display: 'flex',
      alignItems: 'center',
    },
    center: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minW: 0,
      overflow: 'hidden',
    },
    end: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
  },
  variants: {
    size: {
      sm: {root: {minH: 'component.sm'}},
      md: {root: {minH: 'component.md'}},
      lg: {root: {minH: 'component.lg'}},
    },
    orientation: {
      horizontal: {},
      vertical: {
        root: {
          flexDirection: 'column',
          alignItems: 'stretch',
          paddingBlock: '0',
          paddingInline: '2',
          minH: 'auto',
        },
        start: {flexDirection: 'column', alignItems: 'stretch'},
        center: {flexDirection: 'column', alignItems: 'stretch'},
        end: {
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'flex-end',
        },
      },
    },
    gap: gapSlotVariants,
    // Marker variants; the layout differences are orientation-dependent, so
    // they live in compoundVariants below.
    hasCenterContent: {true: {}, false: {}},
    hasStartContent: {true: {}, false: {}},
    hasEndContent: {true: {}, false: {}},
    // Dividers use the hairline treatment Divider owns: the
    // `borderWidths.default` and `colors.border` tokens.
    dividerTop: {
      true: {
        root: {
          borderTopWidth: 'default',
          borderTopStyle: 'solid',
          borderTopColor: 'border',
        },
      },
      false: {},
    },
    dividerBottom: {
      true: {
        root: {
          borderBottomWidth: 'default',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
        },
      },
      false: {},
    },
    dividerStart: {
      true: {
        root: {
          borderInlineStartWidth: 'default',
          borderInlineStartStyle: 'solid',
          borderInlineStartColor: 'border',
        },
      },
      false: {},
    },
    dividerEnd: {
      true: {
        root: {
          borderInlineEndWidth: 'default',
          borderInlineEndStyle: 'solid',
          borderInlineEndColor: 'border',
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    // With center content the layout switches to a 3-track grid so the center
    // slot is truly centered regardless of how wide the outer slots are.
    {
      hasCenterContent: true,
      orientation: 'horizontal',
      css: {root: {display: 'grid', gridTemplateColumns: '1fr auto 1fr'}},
    },
    {
      hasCenterContent: true,
      orientation: 'vertical',
      css: {root: {display: 'grid', gridTemplateRows: '1fr auto 1fr'}},
    },
    // A lone start slot fills the bar; a lone end slot pushes to the far edge.
    {
      hasCenterContent: false,
      hasStartContent: true,
      hasEndContent: false,
      css: {start: {flex: '1 1 0%'}},
    },
    {
      hasCenterContent: false,
      hasStartContent: false,
      hasEndContent: true,
      orientation: 'horizontal',
      css: {end: {marginInlineStart: 'auto'}},
    },
    {
      hasCenterContent: false,
      hasStartContent: false,
      hasEndContent: true,
      orientation: 'vertical',
      css: {end: {marginBlockStart: 'auto'}},
    },
  ],
  // No defaultVariants: Toolbar.tsx always passes every variant explicitly,
  // so defaults here would be dead weight to keep in sync with the component.
});

export type ToolbarVariants = RecipeVariantProps<typeof toolbarRecipe>;
