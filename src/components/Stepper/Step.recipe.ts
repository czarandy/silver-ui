import {cva, type RecipeVariantProps} from 'styled-system/css';
import type {StepState} from './Step';

export const stepIndicatorRecipe = cva({
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    w: '7',
    h: '7',
    borderRadius: 'full',
    fontFamily: 'body',
    fontSize: 'sm',
    fontWeight: 'semibold',
    lineHeight: 'none',
    transitionProperty: 'background-color, color, border-color, opacity',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
    flexShrink: 0,
    userSelect: 'none',
    borderWidth: 'emphasized',
    borderStyle: 'solid',
  },
  variants: {
    state: {
      active: {
        bg: 'primary',
        borderColor: 'primary',
        color: 'fg.onPrimary',
      },
      completed: {
        bg: 'primary',
        borderColor: 'primary',
        color: 'fg.onPrimary',
      },
      upcoming: {
        bg: 'transparent',
        borderColor: 'border.emphasized',
        color: 'fg.muted',
      },
      disabled: {
        bg: 'transparent',
        borderColor: 'border',
        color: 'fg.disabled',
      },
      error: {
        bg: 'status.error.solid',
        borderColor: 'status.error.solid',
        color: 'status.error.solidFg',
      },
    } satisfies Record<StepState, object>,
    isClickable: {
      true: {
        cursor: 'pointer',
        _hover: {
          opacity: 0.85,
        },
        _focusVisible: {
          outlineWidth: 'focus',
          outlineStyle: 'solid',
          outlineColor: 'primary',
          outlineOffset: 'focusOffset',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    state: 'upcoming',
    isClickable: false,
  },
});

export const stepLabelRecipe = cva({
  base: {
    textAlign: 'center',
  },
  variants: {
    state: {
      active: {
        color: 'fg',
        fontWeight: 'semibold',
      },
      completed: {
        color: 'fg',
      },
      upcoming: {
        color: 'fg.muted',
      },
      disabled: {
        color: 'fg.disabled',
      },
      error: {
        color: 'status.error.fg',
      },
    } satisfies Record<StepState, object>,
    orientation: {
      horizontal: {},
      vertical: {
        textAlign: 'start',
      },
    },
  },
  defaultVariants: {
    state: 'upcoming',
    orientation: 'horizontal',
  },
});

export const stepConnectorRecipe = cva({
  base: {
    borderRadius: 'full',
    transitionProperty: 'background-color',
    transitionDuration: 'fast',
    transitionTimingFunction: 'default',
  },
  variants: {
    isCompleted: {
      true: {
        bg: 'primary',
      },
      false: {
        bg: 'track.emphasized',
      },
    },
    orientation: {
      horizontal: {
        h: '0.5',
        w: 'full',
      },
      vertical: {
        w: '0.5',
        h: 'full',
      },
    },
  },
  defaultVariants: {
    isCompleted: false,
    orientation: 'horizontal',
  },
});

export type StepIndicatorVariants = RecipeVariantProps<
  typeof stepIndicatorRecipe
>;
export type StepLabelVariants = RecipeVariantProps<typeof stepLabelRecipe>;
export type StepConnectorVariants = RecipeVariantProps<
  typeof stepConnectorRecipe
>;
