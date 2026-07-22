import {sva, type RecipeVariantProps} from 'styled-system/css';

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
    gap: {
      0: {
        root: {gap: '0'},
        start: {gap: '0'},
        center: {gap: '0'},
        end: {gap: '0'},
      },
      0.5: {
        root: {gap: '0.5'},
        start: {gap: '0.5'},
        center: {gap: '0.5'},
        end: {gap: '0.5'},
      },
      1: {
        root: {gap: '1'},
        start: {gap: '1'},
        center: {gap: '1'},
        end: {gap: '1'},
      },
      1.5: {
        root: {gap: '1.5'},
        start: {gap: '1.5'},
        center: {gap: '1.5'},
        end: {gap: '1.5'},
      },
      2: {
        root: {gap: '2'},
        start: {gap: '2'},
        center: {gap: '2'},
        end: {gap: '2'},
      },
      3: {
        root: {gap: '3'},
        start: {gap: '3'},
        center: {gap: '3'},
        end: {gap: '3'},
      },
      4: {
        root: {gap: '4'},
        start: {gap: '4'},
        center: {gap: '4'},
        end: {gap: '4'},
      },
      5: {
        root: {gap: '5'},
        start: {gap: '5'},
        center: {gap: '5'},
        end: {gap: '5'},
      },
      6: {
        root: {gap: '6'},
        start: {gap: '6'},
        center: {gap: '6'},
        end: {gap: '6'},
      },
      8: {
        root: {gap: '8'},
        start: {gap: '8'},
        center: {gap: '8'},
        end: {gap: '8'},
      },
      10: {
        root: {gap: '10'},
        start: {gap: '10'},
        center: {gap: '10'},
        end: {gap: '10'},
      },
    },
    // Marker variants; the layout differences are orientation-dependent, so
    // they live in compoundVariants below.
    hasCenterContent: {true: {}, false: {}},
    hasStartContent: {true: {}, false: {}},
    hasEndContent: {true: {}, false: {}},
    dividerTop: {
      true: {
        root: {
          borderTopWidth: '1px',
          borderTopStyle: 'solid',
          borderTopColor: 'border',
        },
      },
      false: {},
    },
    dividerBottom: {
      true: {
        root: {
          borderBottomWidth: '1px',
          borderBottomStyle: 'solid',
          borderBottomColor: 'border',
        },
      },
      false: {},
    },
    dividerStart: {
      true: {
        root: {
          borderInlineStartWidth: '1px',
          borderInlineStartStyle: 'solid',
          borderInlineStartColor: 'border',
        },
      },
      false: {},
    },
    dividerEnd: {
      true: {
        root: {
          borderInlineEndWidth: '1px',
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
  defaultVariants: {
    size: 'md',
    orientation: 'horizontal',
    gap: 1,
    hasCenterContent: false,
    hasStartContent: false,
    hasEndContent: false,
    dividerTop: false,
    dividerBottom: false,
    dividerStart: false,
    dividerEnd: false,
  },
});

export type ToolbarVariants = RecipeVariantProps<typeof toolbarRecipe>;
