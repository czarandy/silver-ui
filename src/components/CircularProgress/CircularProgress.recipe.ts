import {sva, type RecipeVariantProps} from 'styled-system/css';

export const circularProgressRecipe = sva({
  slots: ['root', 'visual', 'svg', 'track', 'indicator', 'valueLabel', 'label'],
  base: {
    root: {
      '--circular-progress-size': '64px',
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1',
      verticalAlign: 'middle',
    },
    visual: {
      position: 'relative',
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0,
      w: 'var(--circular-progress-size)',
      h: 'var(--circular-progress-size)',
    },
    svg: {
      position: 'absolute',
      inset: 0,
      w: 'full',
      h: 'full',
      transform: 'rotate(-90deg)',
    },
    track: {
      color: 'bg.hover',
      fill: 'none',
    },
    indicator: {
      fill: 'none',
      transformBox: 'fill-box',
      transformOrigin: 'center',
      transitionProperty: 'stroke-dashoffset, opacity',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
    },
    valueLabel: {
      position: 'relative',
      zIndex: 1,
      maxW: '75%',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'tight',
      overflowWrap: 'anywhere',
      textAlign: 'center',
    },
    label: {
      color: 'fg',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'medium',
      lineHeight: 'normal',
      textAlign: 'center',
    },
  },
  variants: {
    variant: {
      error: {indicator: {color: 'status.error.solid'}},
      info: {indicator: {color: 'status.info.solid'}},
      neutral: {indicator: {color: 'status.neutral.solid'}},
      success: {indicator: {color: 'status.success.solid'}},
      warning: {indicator: {color: 'status.warning.solid'}},
    },
    isDisabled: {
      true: {
        indicator: {color: 'status.disabled.solid'},
        label: {color: 'fg.disabled'},
        valueLabel: {color: 'fg.disabled'},
      },
    },
    isIndeterminate: {
      true: {
        indicator: {
          animation: 'spin 1.5s linear infinite',
          transitionProperty: 'none',
          transitionDuration: '0s',
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'spin 3s linear infinite',
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

export type CircularProgressVariants = RecipeVariantProps<
  typeof circularProgressRecipe
>;
