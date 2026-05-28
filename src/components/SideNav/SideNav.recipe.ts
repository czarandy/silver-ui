import {cva, type RecipeVariantProps} from 'styled-system/css';

export const sideNavRecipe = cva({
  base: {
    display: 'flex',
    flexDirection: 'column',
    h: '100%',
    w: '260px',
    bg: 'inherit',
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  variants: {
    isCollapsed: {
      true: {
        w: '12',
      },
      false: {},
    },
    mode: {
      default: {},
      topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        h: '12',
        w: '100%',
      },
    },
  },
  defaultVariants: {
    isCollapsed: false,
    mode: 'default',
  },
});

export type SideNavVariants = RecipeVariantProps<typeof sideNavRecipe>;
