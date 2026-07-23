import {sva, type RecipeVariantProps} from 'styled-system/css';

export const selectMenuRecipe = sva({
  slots: [
    'menu',
    'search',
    'option',
    'optionContent',
    'check',
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
    search: {
      w: 'full',
      px: '2',
      py: '1',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      borderRadius: 'md',
      fontFamily: 'body',
      outline: 'none',
      _focus: {
        borderColor: 'primary',
      },
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
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
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
      '&[data-highlighted]': {
        bg: 'bg.subtle',
      },
      '&[data-selected]': {
        fontWeight: 'medium',
      },
    },
    optionContent: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2',
      minW: 0,
    },
    check: {
      display: 'inline-flex',
      color: 'primary',
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
});

export type SelectMenuVariants = RecipeVariantProps<typeof selectMenuRecipe>;

export const selectTriggerRecipe = sva({
  slots: ['wrapper', 'trigger', 'label'],
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
    label: {
      flex: 1,
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    isDisabled: {
      true: {wrapper: {cursor: 'not-allowed'}},
      false: {},
    },
    isPlaceholder: {
      true: {label: {color: 'fg.muted'}},
      false: {},
    },
  },
  defaultVariants: {
    isDisabled: false,
    isPlaceholder: false,
  },
});

export type SelectTriggerVariants = RecipeVariantProps<
  typeof selectTriggerRecipe
>;

export const selectOptionItemRecipe = sva({
  slots: ['root', 'icon', 'tooltipIcon'],
  base: {
    root: {
      display: 'flex',
      minW: 0,
      p: 0,
    },
    icon: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'fg.muted',
    },
    tooltipIcon: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'fg.muted',
    },
  },
});

export type SelectOptionItemVariants = RecipeVariantProps<
  typeof selectOptionItemRecipe
>;
