import {cva, sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Group container layout — single element with an orientation variant.
 */
export const radioGroupRecipe = cva({
  base: {
    display: 'flex',
  },
  variants: {
    orientation: {
      vertical: {
        flexDirection: 'column',
        gap: '0.5',
      },
      horizontal: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: '4',
        rowGap: '0',
      },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export type RadioGroupVariants = RecipeVariantProps<typeof radioGroupRecipe>;

/**
 * Individual radio item — multi-slot recipe for the control, its visual
 * radio circle, the selection dot, and the clickable label.
 */
export const radioGroupItemRecipe = sva({
  slots: ['controlWrap', 'input', 'radio', 'dot', 'label'],
  base: {
    controlWrap: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      borderRadius: 'full',
      isolation: 'isolate',
      '&:has(input:focus-visible)': {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    input: {
      position: 'absolute',
      inset: 0,
      m: 0,
      p: 0,
      opacity: 0,
      cursor: 'pointer',
      zIndex: 1,
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    radio: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      borderRadius: 'full',
      bg: 'bg',
      pointerEvents: 'none',
    },
    dot: {
      borderRadius: 'full',
      bg: 'fg.onPrimary',
    },
    label: {
      cursor: 'pointer',
    },
  },
  variants: {
    size: {
      sm: {
        controlWrap: {w: '5', h: '5'},
        radio: {w: '4.5', h: '4.5'},
        dot: {w: '2', h: '2'},
      },
      md: {
        controlWrap: {w: '6', h: '6'},
        radio: {w: '5.5', h: '5.5'},
        dot: {w: '2.5', h: '2.5'},
      },
      lg: {
        controlWrap: {w: '7', h: '7'},
        radio: {w: '6.5', h: '6.5'},
        dot: {w: '3', h: '3'},
      },
    },
    isChecked: {
      true: {
        radio: {bg: 'primary', borderColor: 'primary'},
      },
    },
    isDisabled: {
      true: {
        radio: {opacity: 0.55},
        label: {color: 'fg.disabled', cursor: 'not-allowed'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
    isChecked: false,
    isDisabled: false,
  },
});

export type RadioGroupItemVariants = RecipeVariantProps<
  typeof radioGroupItemRecipe
>;
