import {sva, type RecipeVariantProps} from 'styled-system/css';

export const dateRangeInputRecipe = sva({
  slots: ['wrapper', 'trigger', 'value', 'icon'],
  base: {
    wrapper: {
      cursor: 'pointer',
    },
    trigger: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      flex: 1,
      minW: 0,
      p: 0,
      borderWidth: 0,
      borderStyle: 'none',
      bg: 'transparent',
      color: 'fg',
      cursor: 'pointer',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'normal',
      outline: 'none',
      textAlign: 'start',
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    value: {
      flex: 1,
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      color: 'fg.muted',
    },
  },
  variants: {
    isDisabled: {
      true: {
        wrapper: {cursor: 'not-allowed'},
      },
      false: {},
    },
    isPlaceholder: {
      true: {
        value: {color: 'fg.muted'},
      },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
    isPlaceholder: false,
  },
});

export type DateRangeInputVariants = RecipeVariantProps<
  typeof dateRangeInputRecipe
>;
