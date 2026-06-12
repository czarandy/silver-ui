import type {StepState} from 'components/Stepper/internal/Step';
import {sva, type RecipeVariantProps} from 'styled-system/css';

export const stepRecipe = sva({
  slots: [
    'root',
    'content',
    'indicatorColumn',
    'indicator',
    'labelRow',
    'label',
    'description',
    'connectorWrapper',
    'connector',
    'childrenContent',
  ],
  base: {
    root: {
      display: 'flex',
      position: 'relative',
      '&:last-child [data-step-connector]': {
        display: 'none',
      },
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
    },
    indicatorColumn: {},
    indicator: {
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
    labelRow: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      textAlign: 'center',
    },
    description: {},
    connectorWrapper: {
      flex: 1,
      display: 'flex',
    },
    connector: {
      borderRadius: 'full',
      transitionProperty: 'background-color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
    childrenContent: {
      pt: '3',
    },
  },
  variants: {
    orientation: {
      horizontal: {
        root: {
          flexDirection: 'row',
          alignItems: 'flex-start',
          flex: 1,
          _last: {flex: 'none'},
        },
        content: {
          alignItems: 'center',
          position: 'relative',
          zIndex: 1,
        },
        labelRow: {
          alignItems: 'center',
          pt: '1',
          maxW: '120px',
        },
        description: {textAlign: 'center'},
        connectorWrapper: {
          alignItems: 'center',
          px: '2',
          minW: '6',
          h: '7',
        },
        connector: {h: '0.5', w: 'full'},
      },
      vertical: {
        root: {
          flexDirection: 'row',
          alignItems: 'stretch',
          minH: '12',
        },
        content: {
          ps: '3',
          pb: '6',
          flex: 1,
        },
        indicatorColumn: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          w: '7',
          flexShrink: 0,
        },
        labelRow: {
          alignItems: 'flex-start',
          pt: '0.5',
        },
        label: {textAlign: 'start'},
        description: {textAlign: 'start'},
        connectorWrapper: {
          justifyContent: 'center',
          py: '1',
        },
        connector: {w: '0.5', h: 'full'},
      },
    },
    state: {
      active: {
        indicator: {
          bg: 'primary',
          borderColor: 'primary',
          color: 'fg.onPrimary',
        },
        label: {color: 'fg', fontWeight: 'semibold'},
      },
      completed: {
        indicator: {
          bg: 'primary',
          borderColor: 'primary',
          color: 'fg.onPrimary',
        },
        label: {color: 'fg'},
      },
      upcoming: {
        indicator: {
          bg: 'transparent',
          borderColor: 'border.emphasized',
          color: 'fg.muted',
        },
        label: {color: 'fg.muted'},
      },
      disabled: {
        indicator: {
          bg: 'transparent',
          borderColor: 'border',
          color: 'fg.disabled',
        },
        label: {color: 'fg.disabled'},
      },
      error: {
        indicator: {
          bg: 'status.error.solid',
          borderColor: 'status.error.solid',
          color: 'status.error.solidFg',
        },
        label: {color: 'status.error.fg'},
        description: {color: 'status.error.fg'},
      },
    } satisfies Record<StepState, object>,
    isClickable: {
      true: {
        indicator: {
          cursor: 'pointer',
          m: 0,
          p: 0,
          _hover: {opacity: 0.85},
          _focusVisible: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
      false: {},
    },
    isCompleted: {
      true: {connector: {bg: 'primary'}},
      false: {connector: {bg: 'track.emphasized'}},
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    state: 'upcoming',
    isClickable: false,
    isCompleted: false,
  },
});

export type StepVariants = RecipeVariantProps<typeof stepRecipe>;
