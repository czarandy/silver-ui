import {sva, type RecipeVariantProps} from 'styled-system/css';

// Shared text/layout styling for the expanded-row label. `item` is the row
// itself (leaf and split-action branches) and additionally carries the selected
// highlight; `toggleLabel` is the inner content of the toggle-row button, which
// stays base-only because the highlight lives on the wrapping button instead.
const expandedLabelBase = {
  color: 'fg.muted',
  fontSize: 'sm',
  fontWeight: 'medium',
  minH: '8',
  py: '0.5',
  // Override Item's default `bg.subtle` hover, which is invisible when the
  // SideNav sits on the AppShell's `bg.subtle` surface. Match TopNavItem's
  // darker `bg.hover` so the hover is visible in both navs.
  _hover: {bg: 'bg.hover'},
} as const;

export const sideNavItemRecipe = sva({
  slots: [
    'item',
    'icon',
    'collapsed',
    'toggleRow',
    'toggleLabel',
    'toggleButton',
    'chevron',
    'childrenContainer',
    'childrenInner',
  ],
  base: {
    item: expandedLabelBase,
    toggleLabel: expandedLabelBase,
    icon: {
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 'var(--silver-sizes-icon-md)',
    },
    collapsed: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '10',
      minH: '8',
      px: 0,
      py: '1.5',
      borderRadius: 'md',
      color: 'fg.muted',
      textDecoration: 'none',
      bg: 'transparent',
      borderWidth: 0,
      cursor: 'pointer',
      _hover: {bg: 'bg.hover'},
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    toggleRow: {
      display: 'flex',
      w: '100%',
      cursor: 'pointer',
      borderRadius: 'md',
      _hover: {bg: 'bg.hover'},
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    toggleButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '7',
      h: '7',
      borderRadius: 'md',
      cursor: 'pointer',
      color: 'fg.muted',
      _hover: {bg: 'bg.hover'},
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    chevron: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      transitionProperty: 'transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
    childrenContainer: {
      display: 'grid',
      gridTemplateRows: '1fr',
      transitionProperty: 'grid-template-rows',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
    childrenInner: {
      overflow: 'hidden',
      ps: '6',
    },
  },
  variants: {
    isSelected: {
      true: {
        item: {bg: 'bg.hover', color: 'fg', fontWeight: 'semibold'},
        toggleRow: {bg: 'bg.hover', color: 'fg', fontWeight: 'semibold'},
        collapsed: {bg: 'bg.hover', color: 'fg'},
      },
      false: {},
    },
    isDisabled: {
      true: {
        collapsed: {
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
        toggleRow: {
          opacity: 0.5,
          cursor: 'not-allowed',
          pointerEvents: 'none',
        },
      },
      false: {},
    },
    isExpanded: {
      true: {
        chevron: {transform: 'rotate(180deg)'},
      },
      false: {
        childrenContainer: {gridTemplateRows: '0fr'},
      },
    },
  },
  defaultVariants: {
    isSelected: false,
    isDisabled: false,
    isExpanded: true,
  },
});

export type SideNavItemVariants = RecipeVariantProps<typeof sideNavItemRecipe>;
