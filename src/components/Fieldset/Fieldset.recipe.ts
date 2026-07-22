import type {InputStatusType} from 'components/Field';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldsetRecipe = sva({
  slots: [
    'root',
    'legend',
    'legendContent',
    'indicator',
    'description',
    'content',
  ],
  base: {
    root: {
      minW: 0,
      w: 'full',
      m: 0,
      p: '4',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border',
      borderRadius: 'md',
      bg: 'bg',
      color: 'fg',
    },
    legend: {
      maxW: 'full',
      p: 0,
    },
    legendContent: {
      display: 'inline-flex',
      alignItems: 'baseline',
      gap: '1',
      maxW: 'full',
      px: '1',
      color: 'fg',
    },
    indicator: {
      flexShrink: 0,
      fontWeight: 'normal',
    },
    description: {
      display: 'block',
      mb: '3',
    },
    content: {
      w: 'full',
    },
  },
  variants: {
    isDisabled: {
      false: {},
      true: {
        root: {
          opacity: 0.55,
          cursor: 'not-allowed',
        },
        legendContent: {color: 'fg.disabled'},
      },
    },
    statusType: {
      error: {root: {borderColor: 'status.error.border'}},
      success: {root: {borderColor: 'status.success.border'}},
      warning: {root: {borderColor: 'status.warning.border'}},
    } satisfies Record<InputStatusType, object>,
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export type FieldsetVariants = RecipeVariantProps<typeof fieldsetRecipe>;
