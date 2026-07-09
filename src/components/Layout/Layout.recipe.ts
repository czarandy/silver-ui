import {cva, sva, type RecipeVariantProps} from 'styled-system/css';

const paddingVariants = {
  0: {p: '0'},
  0.5: {p: '0.5'},
  1: {p: '1'},
  1.5: {p: '1.5'},
  2: {p: '2'},
  3: {p: '3'},
  4: {p: '4'},
  5: {p: '5'},
  6: {p: '6'},
  8: {p: '8'},
  10: {p: '10'},
};

// Same padding scale as `paddingVariants`, scoped to the `root` slot so it can
// be used as an `sva` variant on the Layout shell.
const rootPaddingVariants = {
  0: {root: {p: '0'}},
  0.5: {root: {p: '0.5'}},
  1: {root: {p: '1'}},
  1.5: {root: {p: '1.5'}},
  2: {root: {p: '2'}},
  3: {root: {p: '3'}},
  4: {root: {p: '4'}},
  5: {root: {p: '5'}},
  6: {root: {p: '6'}},
  8: {root: {p: '8'}},
  10: {root: {p: '10'}},
};

export const layoutRecipe = sva({
  slots: ['root', 'middle', 'content'],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      minW: 0,
    },
    middle: {
      display: 'flex',
      flex: 1,
      minH: 0,
      minW: 0,
    },
    content: {
      flex: 1,
      minW: 0,
      display: 'flex',
      flexDirection: 'column',
    },
  },
  variants: {
    height: {
      fill: {
        root: {h: '100%', minH: 0},
      },
      auto: {
        root: {minH: '100%'},
      },
    },
    padding: rootPaddingVariants,
  },
  defaultVariants: {
    height: 'fill',
  },
});

export const layoutPanelRecipe = cva({
  base: {
    flexShrink: 0,
    overflow: 'clip',
  },
  variants: {
    isScrollable: {
      true: {overflow: 'auto'},
    },
    divider: {
      none: {},
      // Border on the edge adjacent to the content area: inline-end for a start
      // panel, inline-start for an end panel.
      start: {
        borderInlineEndWidth: 'default',
        borderInlineEndStyle: 'solid',
        borderInlineEndColor: 'border',
      },
      end: {
        borderInlineStartWidth: 'default',
        borderInlineStartStyle: 'solid',
        borderInlineStartColor: 'border',
      },
    },
  },
  defaultVariants: {
    isScrollable: true,
    divider: 'none',
  },
});

export const layoutContentRecipe = cva({
  base: {
    flex: 1,
    minH: 0,
    minW: 0,
    overflow: 'clip',
  },
  variants: {
    isScrollable: {
      true: {overflow: 'auto'},
    },
    // Without a divider, the content's block padding stacks on top of the
    // adjacent region's, so the gap between a title and the body reads as
    // double the gap at the surface's outer edge. Dropping the padding on the
    // meeting edge leaves the header's or footer's own padding to space them.
    // These are longhands, so they override the `padding` shorthand that
    // `layoutRegionRecipe` sets on the same element regardless of class order.
    hasCollapsedBlockStart: {
      true: {paddingBlockStart: '0'},
    },
    hasCollapsedBlockEnd: {
      true: {paddingBlockEnd: '0'},
    },
  },
  defaultVariants: {
    isScrollable: true,
    hasCollapsedBlockStart: false,
    hasCollapsedBlockEnd: false,
  },
});

// Browsers without `text-box-trim` keep the untrimmed leading, so the spacing
// that compensates for the trim is scoped to a feature query.
const supportsTextBoxTrim = '@supports (text-box-trim: trim-both)';

export const layoutHeaderRecipe = sva({
  slots: ['root', 'inner', 'titleArea', 'actions', 'closeButton'],
  base: {
    root: {
      flexShrink: 0,
    },
    inner: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '3',
    },
    titleArea: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minW: 0,
      // Half-leading above the title's cap and below the subtitle's baseline
      // makes the header's padding read as larger than the identical padding of
      // a sibling region whose content is a box (a footer's buttons). Trimming
      // it lands the cap and the baseline flush against the padding edges.
      // The leading also supplies the space between the title and the subtitle,
      // so replace it with an explicit gap under the same feature query.
      '& > *': {
        textBox: 'trim-both cap alphabetic',
      },
      [supportsTextBoxTrim]: {
        gap: '4',
      },
      '& > :focus': {
        outline: 'none',
      },
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flexShrink: 0,
    },
    closeButton: {
      marginInlineEnd: '-2',
      // Center the button on the title's line box, or on its cap box once the
      // leading is trimmed away. Trimming leaves the cap box shorter than the
      // button, so the block margins are pulled in on both sides: a one-sided
      // offset would let the button set the header's height and push the
      // padding below the title open by the difference.
      marginBlockStart: '-2',
      [supportsTextBoxTrim]: {
        marginBlock: '-3',
      },
    },
  },
  variants: {
    // Cross-axis alignment of the start/title/end slots within the header row.
    align: {
      start: {inner: {alignItems: 'flex-start'}},
      center: {inner: {alignItems: 'center'}},
      end: {inner: {alignItems: 'flex-end'}},
    },
    hasDivider: {
      true: {
        root: {
          borderBlockEndWidth: 'default',
          borderBlockEndStyle: 'solid',
          borderBlockEndColor: 'border',
        },
      },
    },
  },
  defaultVariants: {
    align: 'start',
    hasDivider: false,
  },
});

export const layoutFooterRecipe = sva({
  slots: ['root', 'inner', 'start', 'actions'],
  base: {
    root: {
      flexShrink: 0,
    },
    start: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flex: 1,
      minW: 0,
      marginInlineEnd: 'auto',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flexShrink: 0,
    },
  },
  variants: {
    hasDivider: {
      true: {
        root: {
          borderBlockStartWidth: 'default',
          borderBlockStartStyle: 'solid',
          borderBlockStartColor: 'border',
        },
      },
    },
    // Custom footers render arbitrary children, so the inner element drops the
    // action-row flex layout.
    isCustom: {
      false: {
        inner: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '3',
        },
      },
      true: {},
    },
  },
  defaultVariants: {
    hasDivider: false,
    isCustom: false,
  },
});

export const layoutRegionRecipe = cva({
  variants: {
    padding: paddingVariants,
  },
  defaultVariants: {
    padding: 4,
  },
});

export type LayoutVariants = RecipeVariantProps<typeof layoutRecipe>;
export type LayoutRegionVariants = RecipeVariantProps<
  typeof layoutRegionRecipe
>;
