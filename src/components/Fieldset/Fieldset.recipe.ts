import type {InputStatusType} from 'components/Field';
import {statusBorderColor} from 'components/Field/inputStyles';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fieldsetRecipe = sva({
  slots: [
    'wrapper',
    'root',
    'legend',
    'legendContent',
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
      error: {root: {borderColor: statusBorderColor.error}},
      success: {root: {borderColor: statusBorderColor.success}},
      warning: {root: {borderColor: statusBorderColor.warning}},
    } satisfies Record<InputStatusType, object>,
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export type FieldsetVariants = RecipeVariantProps<typeof fieldsetRecipe>;
