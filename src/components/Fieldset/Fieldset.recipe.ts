import type {InputStatusType} from 'components/Field';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldsetRecipe = sva({
  slots: [
    'wrapper',
    'root',
    'legend',
    'legendContent',
    'indicator',
    'description',
    'content',
  ],
  base: {
    wrapper: {
      w: 'full',
    },
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
      color: 'fg.muted',
      fontWeight: 'normal',
    },
    description: {
      display: 'block',
      mb: '3',
      color: 'fg.muted',
    },
    content: {
      w: 'full',
    },
  },
  variants: {
    isDisabled: {
      false: {},
      true: {
        wrapper: {
          opacity: 0.55,
        },
        root: {
          cursor: 'not-allowed',
        },
        legendContent: {color: 'fg.disabled'},
        description: {color: 'fg.disabled'},
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
