import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Multi-cell layout layered on top of Field's shared input chrome.
 */
export const pinInputRecipe = sva({
  slots: ['wrapper', 'cell', 'statusIcon'],
  base: {
    wrapper: {
      display: 'inline-flex',
      w: 'fit-content',
      maxW: 'full',
      gap: 0,
      // Longhand resets so they contest the same properties as inputRecipe's
      // paddingInlineStart/End utilities; a `p: 0` shorthand always loses to
      // those longhands regardless of emission order.
      paddingInlineStart: '0',
      paddingInlineEnd: '0',
      paddingBlock: '0',
      overflow: 'hidden',
    },
    cell: {
      flex: '0 0 auto',
      alignSelf: 'stretch',
      borderInlineStartWidth: 'default',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'border.emphasized',
      borderRadius: 0,
      px: '1',
      textAlign: 'center',
      fontVariantNumeric: 'tabular-nums',
      _first: {
        borderInlineStartWidth: 0,
      },
    },
    statusIcon: {
      flexShrink: 0,
      px: '2',
      borderInlineStartWidth: 'default',
      borderInlineStartStyle: 'solid',
      borderInlineStartColor: 'border.emphasized',
    },
  },
  variants: {
    size: {
      sm: {
        cell: {w: '7', fontSize: 'sm'},
      },
      md: {
        cell: {w: '9', fontSize: 'md'},
      },
      lg: {
        cell: {w: '11', fontSize: 'lg'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type PinInputVariants = RecipeVariantProps<typeof pinInputRecipe>;
