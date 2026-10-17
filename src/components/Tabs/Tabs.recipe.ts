import {sva, type RecipeVariantProps} from 'styled-system/css';

export const tabsRecipe = sva({
  slots: [
    'root',
    'tab',
    'icon',
    'label',
    'labelText',
    'labelSizer',
    'endContent',
  ],
  base: {
    // Tabs never wrap, so when they are wider than the space they have, such
    // as on a phone, the row scrolls sideways instead of overflowing the
    // page. A scroller clips what sticks out of it, so the selected underline
    // sits inside the tab rather than overlapping the divider, and the focus
    // ring is drawn just inside the tab.
    root: {
      display: 'flex',
      alignItems: 'stretch',
      maxW: 'full',
      minW: 0,
      overflowX: 'auto',
      scrollbarWidth: 'none',
    },
    tab: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
      px: '3',
      borderWidth: 0,
      borderBottomWidth: 'emphasized',
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent',
      backgroundColor: 'transparent',
      // Keep hover fills out of the underline area so the divider stays visible.
      backgroundClip: 'padding-box',
      color: 'fg.muted',
      cursor: 'pointer',
      fontFamily: 'body',
      fontSize: 'md',
      fontWeight: 'normal',
      lineHeight: 'normal',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      transitionProperty: 'color, background-color, border-color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      _hover: {
        // The background shorthand would reset backgroundClip to border-box.
        backgroundColor: 'bg.subtle',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: '-2px',
      },
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    label: {
      display: 'inline-grid',
    },
    labelText: {
      gridRowStart: 1,
      gridColumnStart: 1,
    },
    labelSizer: {
      gridRowStart: 1,
      gridColumnStart: 1,
      visibility: 'hidden',
      pointerEvents: 'none',
      fontWeight: 'semibold',
    },
    endContent: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
  },
  variants: {
    size: {
      sm: {tab: {h: 'component.sm'}},
      md: {tab: {h: 'component.md'}},
      lg: {tab: {h: 'component.lg'}},
    },
    layout: {
      hug: {},
      fill: {
        root: {w: 'full'},
        tab: {flex: 1},
      },
    },
    isSelected: {
      true: {
        tab: {
          borderBottomColor: 'primary',
          color: 'fg',
          fontWeight: 'semibold',
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        tab: {
          color: 'fg.disabled',
          cursor: 'not-allowed',
          _hover: {
            backgroundColor: 'transparent',
          },
        },
      },
      false: {},
    },
    // The divider is an inset shadow, under the tabs' own underlines. A
    // border would sit outside the scroller's clip, below the underlines.
    // Without a divider, the negative margin lets the underline hang below
    // the row as before, taking no extra space.
    hasDivider: {
      true: {
        root: {
          boxShadow: 'inset 0 -2px 0 token(colors.border)',
        },
      },
      false: {
        root: {mb: '-2px'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'hug',
    isSelected: false,
    isDisabled: false,
    hasDivider: false,
  },
});

export type TabsVariants = RecipeVariantProps<typeof tabsRecipe>;
