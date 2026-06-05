import {css, sva, type RecipeVariantProps} from 'styled-system/css';

export const autocompleteMenuRecipe = sva({
  slots: ['menu', 'option', 'check', 'loading', 'empty'],
  base: {
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
      maxH: '80',
      overflowY: 'auto',
      p: '1',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2',
      w: 'full',
      borderWidth: 0,
      borderRadius: 'md',
      bg: 'transparent',
      color: 'fg',
      cursor: 'pointer',
      fontFamily: 'body',
      textAlign: 'start',
      _hover: {bg: 'bg.subtle'},
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffsetTight',
      },
    },
    check: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'primary',
    },
    loading: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      p: '2',
      color: 'fg.muted',
      '& > svg': {
        animation: 'spin 0.8s linear infinite',
      },
      '@media (prefers-reduced-motion: reduce)': {
        '& > svg': {animation: 'none'},
      },
    },
    empty: {
      p: '3',
      textAlign: 'center',
    },
  },
  variants: {
    size: {
      sm: {option: {px: '2', py: '1'}},
      md: {option: {px: '2', py: '2'}},
      lg: {option: {px: '3', py: '2.5'}},
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type AutocompleteMenuVariants = RecipeVariantProps<
  typeof autocompleteMenuRecipe
>;

/**
 * Per-option state styles applied via `cx()` since they vary per-row
 * rather than per-component instance.
 */
export const optionHighlightedStyle = css({bg: 'bg.subtle'});
export const optionSelectedStyle = css({fontWeight: 'medium'});

export const autocompleteItemRecipe = sva({
  slots: ['root', 'icon', 'text'],
  base: {
    root: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      minW: 0,
    },
    icon: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'fg.muted',
    },
    text: {
      display: 'flex',
      flexDirection: 'column',
      minW: 0,
    },
  },
  variants: {
    isDisabled: {
      true: {root: {opacity: 0.55}},
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export type AutocompleteItemVariants = RecipeVariantProps<
  typeof autocompleteItemRecipe
>;
