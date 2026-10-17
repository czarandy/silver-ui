import {sva, type RecipeVariantProps} from 'styled-system/css';

// Plain items in a menu that also holds checkable items are indented by the
// indicator gutter (item padding + indicator + Item's content gap) so every
// label starts in the same column.
const CHECKABLE_MENU_PLAIN_ITEM =
  '[role="menu"]:has([role="menuitemcheckbox"], [role="menuitemradio"]) &[role="menuitem"] > *';

export const dropdownMenuItemRecipe = sva({
  slots: ['root', 'start', 'indicator', 'radioDot', 'icon'],
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
      '&[aria-disabled="true"]': {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    // Matches Item's content gap, so the icon sits where a label would.
    start: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2',
    },
    // Reserves the gutter whether or not the item is checked, so toggling never
    // shifts the label.
    indicator: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      w: 'icon.sm',
      h: 'icon.sm',
    },
    radioDot: {
      w: '1.5',
      h: '1.5',
      borderRadius: 'full',
      bg: 'icon.accent',
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
          [CHECKABLE_MENU_PLAIN_ITEM]: {
            paddingInlineStart:
              'calc(token(spacing.1.5) + token(sizes.icon.sm) + token(spacing.2))',
          },
        },
      },
      md: {
        root: {
          minH: 'component.md',
          '& > *': {py: '1.5', px: '2'},
          [CHECKABLE_MENU_PLAIN_ITEM]: {
            paddingInlineStart:
              'calc(token(spacing.2) * 2 + token(sizes.icon.sm))',
          },
        },
      },
      lg: {
        root: {
          minH: 'component.lg',
          '& > *': {py: '2.5', px: '2.5', gap: '2.5'},
          [CHECKABLE_MENU_PLAIN_ITEM]: {
            paddingInlineStart:
              'calc(token(spacing.2.5) + token(sizes.icon.sm) + token(spacing.2))',
          },
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
