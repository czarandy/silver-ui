import {sva, type RecipeVariantProps} from 'styled-system/css';

export const tabMenuRecipe = sva({
  slots: ['chevron', 'menu', 'item', 'itemContent', 'itemIcon', 'check'],
  base: {
    chevron: {
      display: 'inline-flex',
    },
    menu: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5',
      minW: '40',
      p: '1',
    },
    item: {
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
    },
    itemContent: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2',
      minW: 0,
    },
    itemIcon: {
      display: 'inline-flex',
      color: 'fg.muted',
    },
    check: {
      display: 'inline-flex',
      color: 'primary',
    },
  },
  variants: {
    isOpen: {
      true: {chevron: {transform: 'rotate(180deg)'}},
      false: {},
    },
    isItemSelected: {
      true: {item: {fontWeight: 'medium'}},
      false: {},
    },
  },
  defaultVariants: {
    isOpen: false,
    isItemSelected: false,
  },
});

export type TabMenuVariants = RecipeVariantProps<typeof tabMenuRecipe>;
