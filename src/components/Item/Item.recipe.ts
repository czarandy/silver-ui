import type {SpacingToken} from 'internal/spacingTokens';
import {sva, type RecipeVariantProps} from 'styled-system/css';

const paddingVariants = {
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
} as const satisfies Record<SpacingToken, {root: {p: string}}>;

export const itemRecipe = sva({
  slots: [
    'root',
    'interactiveContent',
    'content',
    'textContent',
    'startContent',
    'endContent',
    'endContentInline',
    'labelRow',
    'trailingContent',
  ],
  base: {
    root: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      textAlign: 'start',
      borderRadius: 'md',
    },
    interactiveContent: {
      cursor: 'inherit',
      color: 'inherit',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flex: 1,
      minW: 0,
      textAlign: 'start',
      textDecoration: 'none',
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flex: 1,
      minW: 0,
      textAlign: 'start',
    },
    textContent: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minW: 0,
    },
    startContent: {
      display: 'inline-flex',
      flexShrink: 0,
    },
    endContent: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      marginInlineStart: 'auto',
    },
    endContentInline: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    labelRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
    },
    trailingContent: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
  },
  variants: {
    padding: paddingVariants,
    align: {
      center: {},
      start: {root: {alignItems: 'flex-start'}},
    },
    width: {
      full: {root: {w: 'full'}},
      auto: {},
    },
    isInteractive: {
      true: {
        root: {
          cursor: 'pointer',
          transitionProperty: 'background-color',
          transitionDuration: 'fast',
          transitionTimingFunction: 'default',
          _hover: {bg: 'bg.subtle'},
          _active: {bg: 'bg.hover'},
          '&:has(:focus-visible)': {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
      false: {},
    },
    isHighlighted: {
      true: {root: {bg: 'bg.subtle'}},
      false: {},
    },
    isSelected: {
      true: {root: {bg: 'bg.selected'}},
      false: {},
    },
    // The disabled wrapper dims everything inside it via opacity (which
    // compounds through the tree), so the dimming lives only on the content
    // wrappers — applying it to nested slots like endContent would double-dim.
    isDisabled: {
      true: {
        content: {opacity: 0.5},
        interactiveContent: {opacity: 0.5},
      },
      false: {},
    },
    // Marker variant; whether a parent owns the role gates the disabled root
    // styling, which lives in compoundVariants below.
    hasParentRole: {
      true: {},
      false: {},
    },
  },
  compoundVariants: [
    {
      isDisabled: true,
      hasParentRole: false,
      css: {
        root: {
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
      },
    },
  ],
  defaultVariants: {
    padding: 2,
    align: 'center',
    width: 'full',
    isInteractive: false,
    isHighlighted: false,
    isSelected: false,
    isDisabled: false,
    hasParentRole: false,
  },
});

export type ItemVariants = RecipeVariantProps<typeof itemRecipe>;
