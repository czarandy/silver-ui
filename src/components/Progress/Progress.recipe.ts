import {cva, type RecipeVariantProps} from 'styled-system/css';

export const progressFillRecipe = cva({
  base: {
    h: 'full',
    borderRadius: 'full',
    transitionProperty: 'width',
    transitionDuration: 'normal',
    transitionTimingFunction: 'default',
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
    },
  },
  variants: {
    variant: {
      error: {bg: 'status.error.solid'},
      info: {bg: 'status.info.solid'},
      neutral: {bg: 'status.neutral.solid'},
      success: {bg: 'status.success.solid'},
      warning: {bg: 'status.warning.solid'},
    },
    isDisabled: {
      true: {bg: 'status.disabled.solid'},
      false: {},
    },
    isIndeterminate: {
      true: {
        w: '40%',
        animation: 'pulse 1.5s ease-in-out infinite',
        transitionProperty: 'none',
        transitionDuration: '0s',
        '@media (prefers-reduced-motion: reduce)': {
          animation: 'pulse 3s ease-in-out infinite',
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'info',
    isDisabled: false,
    isIndeterminate: false,
  },
});

export type ProgressFillVariants = RecipeVariantProps<
  typeof progressFillRecipe
>;
