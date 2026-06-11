import {sva, type RecipeVariantProps} from 'styled-system/css';

/**
 * Layout styling layered on top of Field's `inputRecipe`. The core input
 * chrome (border, focus ring, status colors) comes from `inputRecipe`; this
 * recipe owns the multi-line wrapper, tag/input slots, and the truncated
 * "+N more" overflow presentation.
 */
export const tagsInputRecipe = sva({
  slots: [
    'wrapper',
    'tag',
    'input',
    'endContent',
    'overflowText',
    'liveRegion',
    'layerPopover',
  ],
  base: {
    wrapper: {
      cursor: 'text',
      flexWrap: 'wrap',
      alignItems: 'center',
      h: 'auto',
    },
    tag: {flexShrink: 0},
    input: {
      minW: '10',
      flex: '1 1 40px',
    },
    endContent: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
    },
    overflowText: {
      flexShrink: 0,
      whiteSpace: 'nowrap',
      fontSize: 'sm',
      color: 'fg.muted',
      px: '1',
    },
    liveRegion: {
      position: 'absolute',
      w: '1px',
      h: '1px',
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
    },
    layerPopover: {
      w: 'anchor-size(width)',
    },
  },
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    // Row gap + vertical padding for wrapped tags. Applied only while not
    // truncated; the size-keyed padding lives in compoundVariants.
    hasTags: {
      true: {},
      false: {},
    },
    // Collapses the wrapper to a single line for the "+N more" presentation.
    isTruncated: {
      true: {wrapper: {flexWrap: 'nowrap', overflow: 'hidden'}},
      false: {},
    },
    // Fixed single-line height. Size-keyed values live in compoundVariants.
    hasFixedHeight: {
      true: {},
      false: {},
    },
    // Hides the text input (when at max entries or in the collapsed view).
    isInputHidden: {
      true: {
        input: {
          position: 'absolute',
          opacity: 0,
          w: 0,
          minW: 0,
          flexBasis: 0,
        },
      },
      false: {},
    },
  },
  compoundVariants: [
    {hasTags: true, isTruncated: false, css: {wrapper: {rowGap: '1'}}},
    {
      size: 'sm',
      hasTags: true,
      isTruncated: false,
      css: {wrapper: {pt: '0px', pb: '0.5'}},
    },
    {size: 'md', hasTags: true, isTruncated: false, css: {wrapper: {py: '1'}}},
    {size: 'lg', hasTags: true, isTruncated: false, css: {wrapper: {py: '1'}}},
    {size: 'sm', hasFixedHeight: true, css: {wrapper: {h: 'component.sm'}}},
    {size: 'md', hasFixedHeight: true, css: {wrapper: {h: 'component.md'}}},
    {size: 'lg', hasFixedHeight: true, css: {wrapper: {h: 'component.lg'}}},
  ],
  defaultVariants: {
    size: 'md',
    hasTags: false,
    isTruncated: false,
    hasFixedHeight: false,
    isInputHidden: false,
  },
});

export type TagsInputVariants = RecipeVariantProps<typeof tagsInputRecipe>;
