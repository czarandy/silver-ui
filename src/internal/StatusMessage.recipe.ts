import {cva, type RecipeVariantProps} from 'styled-system/css';

export const statusMessageRecipe = cva({
  base: {
    fontFamily: 'body',
    fontSize: 'sm',
    lineHeight: 'normal',
    px: '2',
    py: '1.5',
  },
  variants: {
    statusType: {
      warning: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
      error: {bg: 'surface.red', color: 'surface.red.fg'},
      success: {bg: 'surface.green', color: 'surface.green.fg'},
    },
    variant: {
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
  },
  defaultVariants: {
    variant: 'attached',
  },
});

export type StatusMessageVariants = RecipeVariantProps<
  typeof statusMessageRecipe
>;
