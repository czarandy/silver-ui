import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldRecipe = sva({
  slots: [
    'root',
    'labelRow',
    'label',
    'labelIcon',
    'tooltipIcon',
    'labelEnd',
    'inputWrapper',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
    },
    labelRow: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'baseline',
      gap: '2',
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
    tooltipIcon: {
      display: 'inline-flex',
      alignSelf: 'center',
      color: 'fg.muted',
    },
    // `marginInlineStart: auto` pushes the content to the inline end both
    // inside the label row and, when the label is hidden, as a direct child
    // of the column root (where it also stops the item from stretching).
    labelEnd: {
      marginInlineStart: 'auto',
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
    isReadOnly: {
      true: {
        label: {cursor: 'default'},
      },
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
    isReadOnly: false,
  },
});

export type FieldVariants = RecipeVariantProps<typeof fieldRecipe>;
