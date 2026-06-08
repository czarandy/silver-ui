import {sva, type RecipeVariantProps} from 'styled-system/css';

export const toggleButtonRecipe = sva({
  slots: [
    'root',
    'content',
    'labelWrapper',
    'label',
    'widthReservation',
    'icon',
    'spinner',
  ],
  base: {
    content: {
      display: 'contents',
    },
    labelWrapper: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minW: 0,
    },
    label: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minW: 0,
    },
    widthReservation: {
      display: 'block',
      h: 0,
      overflow: 'hidden',
      visibility: 'hidden',
      pointerEvents: 'none',
      fontWeight: 'semibold',
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    spinner: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'inherit',
    },
  },
  variants: {
    // The core button visuals (size/variant/iconOnly) come from the shared
    // `buttonRecipe`; this recipe only layers the selected-state override on the
    // root, which is composed with the button root via `cx`.
    isSelected: {
      true: {
        root: {
          bg: 'bg.subtle',
          fontWeight: 'semibold',
          _hover: {bg: 'bg.subtle'},
          _active: {bg: 'bg.subtle'},
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    isSelected: false,
  },
});

export type ToggleButtonVariants = RecipeVariantProps<
  typeof toggleButtonRecipe
>;
