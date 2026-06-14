import {sva, type RecipeVariantProps} from 'styled-system/css';

export const checkboxInputRecipe = sva({
  slots: [
    'root',
    'boxWrap',
    'input',
    'box',
    'icon',
    'label',
    'indicator',
    'tooltipIcon',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
    boxWrap: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    input: {
      position: 'absolute',
      inset: 0,
      opacity: 0,
      cursor: 'pointer',
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    box: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      borderRadius: 'sm',
      bg: 'bg',
      color: 'fg.onPrimary',
      pointerEvents: 'none',
      _peerFocusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    icon: {
      w: '70%',
      h: '70%',
      mt: '1px',
    },
    label: {
      cursor: 'pointer',
    },
    indicator: {
      fontWeight: 'normal',
      color: 'fg.muted',
    },
    tooltipIcon: {
      display: 'inline-flex',
      color: 'fg.muted',
    },
  },
  variants: {
    size: {
      sm: {box: {w: '4.5', h: '4.5'}},
      md: {box: {w: '5.5', h: '5.5'}},
      lg: {box: {w: '6.5', h: '6.5'}},
    },
    isChecked: {
      true: {box: {bg: 'primary', borderColor: 'primary'}},
      false: {},
    },
    isDisabled: {
      true: {
        box: {opacity: 0.55},
        label: {cursor: 'not-allowed'},
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    isChecked: false,
    isDisabled: false,
  },
});

export type CheckboxInputVariants = RecipeVariantProps<
  typeof checkboxInputRecipe
>;
