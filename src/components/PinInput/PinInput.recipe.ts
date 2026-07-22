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
      // The `!` overrides beat inputRecipe's gap: '2' and inline paddings by
      // importance. Same-specificity utility conflicts resolve by stylesheet
      // emission order, which varies between Panda builds (Storybook, docs
      // site, consuming apps), so plain declarations here are not reliable.
      gap: '0!',
      paddingInline: '0!',
      overflow: 'hidden',
    },
    cell: {
      // Beats inputStyles.control's flex: 1 regardless of emission order.
      flex: '0 0 auto!',
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
      // The fontSize `!` overrides beat inputStyles.control's unconditional
      // fontSize: 'md'; without them the sm/lg cell text silently renders at
      // md whenever the fs_md utility is emitted later in the stylesheet.
      sm: {
        cell: {w: '7', fontSize: 'sm!'},
      },
      md: {
        cell: {w: '9', fontSize: 'md!'},
      },
      lg: {
        cell: {w: '11', fontSize: 'lg!'},
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type PinInputVariants = RecipeVariantProps<typeof pinInputRecipe>;
