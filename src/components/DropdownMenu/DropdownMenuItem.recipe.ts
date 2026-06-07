import {sva, type RecipeVariantProps} from 'styled-system/css';

export const dropdownMenuItemRecipe = sva({
  slots: ['root', 'icon'],
  base: {
    root: {
      display: 'block',
      w: 'full',
      borderRadius: 'md',
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
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    icon: {
      display: 'inline-flex',
      flexShrink: 0,
      color: 'fg.muted',
    },
  },
  variants: {
    size: {
      sm: {
        root: {
          minH: 'component.sm',
          '& > *': {py: '0.5', px: '1.5', gap: '1.5'},
        },
      },
      md: {
        root: {minH: 'component.md', '& > *': {py: '1.5', px: '2'}},
      },
      lg: {
        root: {
          minH: 'component.lg',
          '& > *': {py: '2.5', px: '2.5', gap: '2.5'},
        },
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export type DropdownMenuItemVariants = RecipeVariantProps<
  typeof dropdownMenuItemRecipe
>;
