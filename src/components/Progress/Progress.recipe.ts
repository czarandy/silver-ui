import {sva, type RecipeVariantProps} from 'styled-system/css';

export const progressRecipe = sva({
  slots: ['container', 'header', 'label', 'valueLabel', 'track', 'fill'],
  base: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      w: 'full',
      minW: '12',
    },
    header: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: '2',
    },
    label: {
      color: 'fg',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'medium',
      lineHeight: 'normal',
    },
    valueLabel: {
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'normal',
      whiteSpace: 'nowrap',
    },
    track: {
      w: 'full',
      h: '2',
      overflow: 'hidden',
      borderRadius: 'full',
      bg: 'bg.hover',
    },
    fill: {
      h: 'full',
      borderRadius: 'full',
      transitionProperty: 'width',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
    },
  },
  variants: {
    variant: {
      error: {fill: {bg: 'status.error.solid'}},
      info: {fill: {bg: 'status.info.solid'}},
      neutral: {fill: {bg: 'status.neutral.solid'}},
      success: {fill: {bg: 'status.success.solid'}},
      warning: {fill: {bg: 'status.warning.solid'}},
    },
    isDisabled: {
      true: {
        fill: {bg: 'status.disabled.solid'},
        label: {color: 'fg.disabled'},
        valueLabel: {color: 'fg.disabled'},
      },
    },
    isIndeterminate: {
      true: {
        fill: {
          w: '40%',
          animation: 'pulse 1.5s ease-in-out infinite',
          transitionProperty: 'none',
          transitionDuration: '0s',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'pulse 3s ease-in-out infinite',
          },
        },
      },
    },
  },
  defaultVariants: {
    variant: 'info',
    isDisabled: false,
    isIndeterminate: false,
  },
});

export type ProgressVariants = RecipeVariantProps<typeof progressRecipe>;
