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
    root: {
      display: 'flex',
      alignItems: 'stretch',
      maxW: 'full',
      minW: 0,
    },
    tab: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
      mb: '-1px',
      px: '3',
      borderWidth: 0,
      borderBottomWidth: 'emphasized',
      borderBottomStyle: 'solid',
      borderBottomColor: 'transparent',
      bg: 'transparent',
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
        bg: 'bg.subtle',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
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
          borderBottomColor: 'fg',
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
            bg: 'transparent',
          },
        },
      },
      false: {},
    },
    hasDivider: {
      true: {
        root: {
          borderBlockEndWidth: 'default',
          borderBlockEndStyle: 'solid',
          borderBlockEndColor: 'border',
        },
      },
      false: {},
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
