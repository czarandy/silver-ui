import {sva, type RecipeVariantProps} from 'styled-system/css';

export const treeViewItemRecipe = sva({
  slots: [
    'wrapper',
    'treeBranches',
    'rowWrapper',
    'contentWrapper',
    'toggleButton',
    'toggleSpacer',
    'toggleIcon',
    'startContent',
    'content',
    'invisibleAction',
    'label',
    'description',
    'endContent',
    'childGroup',
  ],
  base: {
    wrapper: {
      position: 'relative',
      m: 0,
      p: 0,
      w: 'full',
      listStyleType: 'none',
      outline: 'none',
    },
    treeBranches: {
      ps: '2',
    },
    rowWrapper: {
      position: 'relative',
    },
    contentWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      overflow: 'hidden',
      px: '2',
      borderRadius: 'md',
      outline: 'none',
      textAlign: 'start',
    },
    toggleButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '4',
      h: '4',
      borderRadius: 'sm',
      color: 'fg.muted',
      cursor: 'pointer',
    },
    toggleSpacer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '4',
      h: '4',
      color: 'fg.muted',
    },
    toggleIcon: {
      display: 'flex',
      transitionDuration: 'fast',
      transitionProperty: 'transform',
      transitionTimingFunction: 'default',
    },
    startContent: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    content: {
      display: 'flex',
      flex: 1,
      minW: 0,
      flexDirection: 'column',
      textAlign: 'start',
    },
    invisibleAction: {
      display: 'flex',
      flex: 1,
      minW: 0,
      flexDirection: 'column',
      color: 'inherit',
      cursor: 'inherit',
      font: 'inherit',
      textAlign: 'start',
      textDecoration: 'none',
      outline: 'none',
    },
    label: {
      color: 'fg',
    },
    description: {
      color: 'fg.muted',
      fontSize: 'xs',
      lineHeight: 'normal',
    },
    endContent: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0,
      ml: 'auto',
    },
    childGroup: {
      m: 0,
      p: 0,
      listStyleType: 'none',
    },
  },
  variants: {
    density: {
      balanced: {
        contentWrapper: {py: '2', fontSize: 'sm', lineHeight: 'normal'},
      },
      compact: {
        contentWrapper: {py: '1', fontSize: 'sm', lineHeight: 'normal'},
      },
      spacious: {
        contentWrapper: {py: '3', fontSize: 'sm', lineHeight: 'normal'},
      },
    },
    isInteractive: {
      true: {
        contentWrapper: {
          cursor: 'pointer',
          transitionDuration: 'fast',
          transitionProperty: 'background-color',
          transitionTimingFunction: 'default',
          _active: {
            bg: 'bg.hover',
          },
          _hover: {
            '@media (hover: hover)': {
              bg: 'bg.subtle',
            },
          },
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        contentWrapper: {
          cursor: 'not-allowed',
          opacity: 0.5,
          pointerEvents: 'none',
        },
      },
      false: {},
    },
    isSelected: {
      true: {
        contentWrapper: {bg: 'bg.selected'},
      },
      false: {},
    },
    isFocused: {
      true: {
        contentWrapper: {
          outlineWidth: 'focus',
          outlineStyle: 'solid',
          outlineColor: 'primary',
          outlineOffset: 'focusOffset',
        },
      },
      false: {},
    },
    isExpanded: {
      true: {
        toggleIcon: {transform: 'rotate(90deg)'},
      },
      false: {},
    },
  },
  defaultVariants: {
    density: 'balanced',
    isInteractive: false,
    isDisabled: false,
    isSelected: false,
    isFocused: false,
    isExpanded: false,
  },
});

export type TreeViewItemVariants = RecipeVariantProps<
  typeof treeViewItemRecipe
>;
