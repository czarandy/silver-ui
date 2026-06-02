import {cva, type RecipeVariantProps} from 'styled-system/css';

export const fieldLabelRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    w: 'fit-content',
    color: 'fg',
    cursor: 'pointer',
  },
  variants: {
    isDisabled: {
      true: {
        cursor: 'not-allowed',
        color: 'fg.disabled',
      },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export type FieldLabelVariants = RecipeVariantProps<typeof fieldLabelRecipe>;

export const fieldStatusRecipe = cva({
  base: {
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    px: '2',
    py: '1.5',
  },
  variants: {
    statusVariant: {
      attached: {
        mt: '-1',
        pt: '2.5',
        borderBottomRadius: 'md',
      },
      detached: {
        mt: '1',
        borderRadius: 'md',
      },
    },
    statusType: {
      warning: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
      error: {bg: 'surface.red', color: 'surface.red.fg'},
      success: {bg: 'surface.green', color: 'surface.green.fg'},
    },
  },
  defaultVariants: {
    statusVariant: 'attached',
  },
});

export type FieldStatusVariants = RecipeVariantProps<typeof fieldStatusRecipe>;
