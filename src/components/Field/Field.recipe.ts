import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldRecipe = sva({
  slots: [
    'root',
    'label',
    'labelIcon',
    'indicator',
    'tooltipIcon',
    'inputWrapper',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
    },
    label: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '1',
      w: 'fit-content',
      color: 'fg',
      cursor: 'pointer',
    },
    labelIcon: {
      alignSelf: 'center',
    },
    indicator: {
      fontWeight: 'normal',
      color: 'fg.muted',
    },
    tooltipIcon: {
      display: 'inline-flex',
      alignSelf: 'center',
      color: 'fg.muted',
    },
    inputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      isolation: 'isolate',
    },
  },
  variants: {
    isDisabled: {
      true: {
        label: {
          cursor: 'not-allowed',
          color: 'fg.disabled',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export type FieldVariants = RecipeVariantProps<typeof fieldRecipe>;
