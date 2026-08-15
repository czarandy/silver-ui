import {sva, type RecipeVariantProps} from 'styled-system/css';

export const multiSelectMenuRecipe = sva({
  slots: [
    'menu',
    'option',
    'optionContent',
    'checkbox',
    'iconSlot',
    'sectionHeading',
    'divider',
  ],
  base: {
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
      maxH: '80',
      overflowY: 'auto',
      p: '1',
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      w: 'full',
      px: '2',
      py: '2',
      borderWidth: 0,
      borderRadius: 'md',
      bg: 'transparent',
      color: 'fg',
      cursor: 'pointer',
      fontFamily: 'body',
      textAlign: 'start',
      _hover: {bg: 'bg.subtle'},
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffsetTight',
      },
      '&[aria-disabled="true"]': {
        opacity: 0.55,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    optionContent: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2',
      minW: 0,
      flex: 1,
    },
    checkbox: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: '5',
      h: '5',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'fg.muted',
      borderRadius: 'sm',
      bg: 'bg',
      color: 'fg.onPrimary',
    },
    iconSlot: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      color: 'fg.muted',
    },
    sectionHeading: {
      px: '2',
      py: '1',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'sm',
      fontWeight: 'semibold',
    },
    divider: {
      h: '1px',
      bg: 'border',
      my: '1',
    },
  },
  variants: {
    isHighlighted: {
      true: {option: {bg: 'bg.subtle'}},
      false: {},
    },
    isSelected: {
      true: {checkbox: {bg: 'primary', borderColor: 'primary'}},
      false: {},
    },
  },
  defaultVariants: {
    isHighlighted: false,
    isSelected: false,
  },
});

export type MultiSelectMenuVariants = RecipeVariantProps<
  typeof multiSelectMenuRecipe
>;

export const multiSelectTriggerRecipe = sva({
  slots: ['wrapper', 'trigger', 'triggerText', 'badges'],
  base: {
    wrapper: {
      cursor: 'pointer',
    },
    trigger: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2',
      flex: 1,
      minW: 0,
      p: 0,
      borderWidth: 0,
      bg: 'transparent',
      color: 'inherit',
      cursor: 'pointer',
      fontFamily: 'body',
      outline: 'none',
      textAlign: 'start',
      _disabled: {
        cursor: 'not-allowed',
      },
    },
    triggerText: {
      flex: 1,
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    badges: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      minW: 0,
      overflow: 'hidden',
    },
  },
  variants: {
    variant: {
      outline: {},
      ghost: {
        wrapper: {
          borderWidth: 0,
          borderStyle: 'none',
          borderColor: 'transparent',
          bg: 'transparent',
          color: 'fg',
          transitionProperty: 'background-color, opacity',
          _hover: {
            borderColor: 'transparent',
            bg: 'bg.ghost.hover',
          },
          _active: {bg: 'bg.ghost.active'},
          _focusWithin: {
            borderColor: 'transparent',
            boxShadow: 'none',
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffsetLoose',
            _hover: {borderColor: 'transparent'},
          },
        },
      },
      button: {
        wrapper: {
          borderWidth: 0,
          borderStyle: 'none',
          borderColor: 'transparent',
          bg: 'surface.gray',
          color: 'fg',
          transitionProperty: 'background-color, opacity',
          _hover: {
            borderColor: 'transparent',
            bg: 'surface.gray.hover',
          },
          _active: {bg: 'surface.gray.hover'},
          _focusWithin: {
            borderColor: 'transparent',
            boxShadow: 'none',
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffsetLoose',
            _hover: {borderColor: 'transparent'},
          },
        },
      },
    },
    isDisabled: {
      true: {wrapper: {cursor: 'not-allowed'}},
      false: {},
    },
    isPlaceholder: {
      true: {triggerText: {color: 'fg.muted'}},
      false: {},
    },
  },
  compoundVariants: [
    {
      variant: 'ghost',
      isDisabled: true,
      css: {
        wrapper: {
          _hover: {bg: 'transparent'},
          _active: {bg: 'transparent'},
        },
      },
    },
    {
      variant: 'button',
      isDisabled: true,
      css: {
        wrapper: {
          _hover: {bg: 'surface.gray'},
          _active: {bg: 'surface.gray'},
        },
      },
    },
  ],
  defaultVariants: {
    variant: 'outline',
    isDisabled: false,
    isPlaceholder: false,
  },
});

export type MultiSelectTriggerVariants = RecipeVariantProps<
  typeof multiSelectTriggerRecipe
>;
