import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldRecipe = sva({
  slots: [
    'root',
    'label',
    'indicator',
    'tooltipIcon',
    'inputWrapper',
    'status',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
    },
    label: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      w: 'fit-content',
      color: 'fg',
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
    inputWrapper: {
      display: 'flex',
      flexDirection: 'column',
      isolation: 'isolate',
    },
    status: {
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'normal',
      px: '2',
      py: '1.5',
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
    statusType: {
      warning: {status: {bg: 'surface.yellow', color: 'surface.yellow.fg'}},
      error: {status: {bg: 'surface.red', color: 'surface.red.fg'}},
      success: {status: {bg: 'surface.green', color: 'surface.green.fg'}},
    },
    statusVariant: {
      attached: {
        status: {
          mt: '-1',
          pt: '2.5',
          borderBottomRadius: 'md',
        },
      },
      detached: {
        status: {
          mt: '1',
          borderRadius: 'md',
        },
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
    statusVariant: 'attached',
  },
});

export type FieldVariants = RecipeVariantProps<typeof fieldRecipe>;
