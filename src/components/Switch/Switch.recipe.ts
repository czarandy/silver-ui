import {sva, type RecipeVariantProps} from 'styled-system/css';

export const switchRecipe = sva({
  slots: [
    'field',
    'row',
    'labelWrapper',
    'label',
    'labelIcon',
    'requiredness',
    'tooltipIcon',
    'status',
    'control',
    'input',
    'track',
    'thumb',
  ],
  base: {
    field: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1',
      w: 'fit-content',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
    },
    labelWrapper: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
      minW: 0,
    },
    label: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      w: 'fit-content',
      color: 'fg.muted',
      cursor: 'pointer',
    },
    labelIcon: {
      display: 'inline-flex',
      alignItems: 'center',
    },
    requiredness: {
      fontWeight: 'normal',
      color: 'fg.muted',
    },
    tooltipIcon: {
      display: 'inline-flex',
      color: 'fg.muted',
    },
    status: {
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'normal',
      px: '2',
      py: '1.5',
      mt: '1',
      borderRadius: 'md',
    },
    control: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      w: '10',
      h: '6',
      borderRadius: 'full',
      isolation: 'isolate',
      '&:has(input:focus-visible)': {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
      '& [data-switch-track][data-selected="true"]': {
        bg: 'primary',
      },
      '&:has(input:active:not(:disabled)) [data-switch-track]': {
        bg: 'primary.active',
      },
    },
    input: {
      position: 'absolute',
      inset: 0,
      m: 0,
      p: 0,
      opacity: 0,
      cursor: 'pointer',
      zIndex: 1,
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    track: {
      display: 'flex',
      alignItems: 'center',
      w: '10',
      h: '6',
      p: '1',
      borderRadius: 'full',
      bg: 'track.emphasized',
      transitionProperty: 'background-color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      pointerEvents: 'none',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
    },
    thumb: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: '4',
      h: '4',
      borderRadius: 'full',
      bg: 'bg',
      color: 'primary',
      transform: 'translateX(0)',
      transitionProperty: 'transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0s',
      },
    },
  },
  variants: {
    labelSpacing: {
      default: {},
      spread: {
        field: {w: 'full'},
        row: {justifyContent: 'space-between', w: 'full'},
      },
    },
    isSelected: {
      true: {
        track: {bg: 'primary'},
        thumb: {transform: 'translateX(16px)'},
      },
      false: {},
    },
    isDisabled: {
      true: {
        label: {color: 'fg.disabled', cursor: 'not-allowed'},
        track: {opacity: 0.5},
      },
      false: {},
    },
    // Applied only when a status message is rendered (status?.type is defined).
    status: {
      warning: {status: {bg: 'surface.yellow', color: 'surface.yellow.fg'}},
      error: {status: {bg: 'surface.red', color: 'surface.red.fg'}},
      success: {status: {bg: 'surface.green', color: 'surface.green.fg'}},
    },
  },
  defaultVariants: {
    labelSpacing: 'default',
    isSelected: false,
    isDisabled: false,
  },
});

export type SwitchVariants = RecipeVariantProps<typeof switchRecipe>;
