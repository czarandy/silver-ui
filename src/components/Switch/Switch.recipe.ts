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
    // Track heights match the RadioGroup control sizes (20/24/28px) so a
    // switch lines up with a checkbox or radio of the same size. The track
    // keeps a constant 4px inset, which makes the thumb `height - 8px` and
    // its travel `width - height`.
    size: {
      sm: {
        control: {w: '8', h: '5'},
        track: {w: '8', h: '5'},
        thumb: {
          w: '3',
          h: '3',
          '--switch-thumb-travel': '12px',
          '& [data-switch-spinner]': {'--spinner-size': '12px'},
        },
      },
      md: {
        control: {w: '10', h: '6'},
        track: {w: '10', h: '6'},
        thumb: {
          w: '4',
          h: '4',
          '--switch-thumb-travel': '16px',
          '& [data-switch-spinner]': {'--spinner-size': '16px'},
        },
      },
      lg: {
        control: {w: '12', h: '7'},
        track: {w: '12', h: '7'},
        thumb: {
          w: '5',
          h: '5',
          '--switch-thumb-travel': '20px',
          '& [data-switch-spinner]': {'--spinner-size': '20px'},
        },
      },
    },
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
        thumb: {transform: 'translateX(var(--switch-thumb-travel))'},
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
    size: 'md',
    labelSpacing: 'default',
    isSelected: false,
    isDisabled: false,
  },
});

export type SwitchVariants = RecipeVariantProps<typeof switchRecipe>;
