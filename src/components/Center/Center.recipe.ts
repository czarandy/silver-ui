import {
  paddingBlockEndVariants,
  paddingBlockStartVariants,
  paddingInlineEndVariants,
  paddingInlineStartVariants,
  paddingVariants,
} from 'internal/spacingTokens';
import {cva, type RecipeVariantProps} from 'styled-system/css';

export const centerRecipe = cva({
  base: {
    display: 'flex',
  },
  variants: {
    axis: {
      both: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      horizontal: {
        justifyContent: 'center',
      },
      vertical: {
        alignItems: 'center',
      },
    },
    isInline: {
      true: {
        display: 'inline-flex',
      },
    },
    padding: paddingVariants,
    paddingBlockEnd: paddingBlockEndVariants,
    paddingBlockStart: paddingBlockStartVariants,
    paddingInlineEnd: paddingInlineEndVariants,
    paddingInlineStart: paddingInlineStartVariants,
  },
  defaultVariants: {
    axis: 'both',
    isInline: false,
  },
});

export type CenterVariants = RecipeVariantProps<typeof centerRecipe>;
