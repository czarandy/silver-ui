import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Multi-cell layout layered on top of Field's shared input chrome.
 */
export const pinInputRecipe = sva({
  slots: ['root', 'wrapper', 'cell', 'statusIcon'],
  base: {
    // Applied to the Field root: the cells give the control an intrinsic
    // width, so the field (label, description, status message) locks to the
    // cell row's width instead of spreading to the container. min-content
    // resolves to the cell row because the cells cannot shrink, while longer
    // text children wrap at that width.
    root: {
      w: 'min-content',
    },
    wrapper: {
      display: 'inline-flex',
      w: 'fit-content',
      maxW: 'full',
      // Overrides of inputRecipe values (gap: '2', inline paddings) must use
      // the exact same property keys: PinInput merges this slot into
      // inputRecipe.raw() with css(), which resolves same-key conflicts in JS
      // rather than leaving two utilities to race in the cascade.
      gap: '0',
      paddingInlineStart: '0',
      paddingInlineEnd: '0',
      overflow: 'hidden',
    },
    cell: {
      // Overrides inputControlStyles' flex: 1 via the same css() merge.
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
      // fontSize overrides inputControlStyles' unconditional 'md' through the
      // css() merge in PinInput; as a bare class it would silently lose to
      // fs_md whenever that utility is emitted later in the stylesheet.
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
