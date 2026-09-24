import {
  gapVariants,
  paddingBlockEndVariants,
  paddingBlockStartVariants,
  paddingInlineEndVariants,
  paddingInlineStartVariants,
  paddingVariants,
} from 'internal/spacingTokens';
import {cva, type RecipeVariantProps} from 'styled-system/css';

export const stackRecipe = cva({
  base: {
    display: 'flex',
    minW: 0,
  },
  variants: {
    direction: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
    gap: gapVariants,
    padding: paddingVariants,
    paddingBlockEnd: paddingBlockEndVariants,
    paddingBlockStart: paddingBlockStartVariants,
    paddingInlineEnd: paddingInlineEndVariants,
    paddingInlineStart: paddingInlineStartVariants,
    wrap: {
      nowrap: {
        flexWrap: 'nowrap',
      },
      wrap: {
        flexWrap: 'wrap',
      },
      'wrap-reverse': {
        flexWrap: 'wrap-reverse',
      },
    },
  },
  defaultVariants: {
    direction: 'vertical',
    wrap: 'nowrap',
  },
});

export type StackVariants = RecipeVariantProps<typeof stackRecipe>;
