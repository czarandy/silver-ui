import {sva, type RecipeVariantProps} from 'styled-system/css';

export const sideNavRecipe = sva({
  slots: [
    'root',
    'stickyTop',
    'scrollable',
    'stickyBottom',
    'footerRow',
    'footerIcons',
    'topbarIcons',
  ],
  base: {
    root: {
      display: 'flex',
      flexDirection: 'column',
      h: '100%',
      w: '260px',
      bg: 'inherit',
      overflow: 'hidden',
    },
    stickyTop: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      p: '2',
      gap: '2',
    },
    scrollable: {
      flex: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      px: '2',
    },
    stickyBottom: {
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      mt: 'auto',
      p: '2',
      gap: '2',
      borderBlockStartWidth: 'default',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'border',
    },
    footerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    footerIcons: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      ms: 'auto',
    },
    topbarIcons: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      ms: 'auto',
    },
  },
  variants: {
    isCollapsed: {
      true: {
        root: {
          w: '12',
        },
        scrollable: {
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        footerRow: {
          flexDirection: 'column-reverse',
          alignItems: 'center',
        },
        footerIcons: {
          flexDirection: 'column',
          alignItems: 'center',
          ms: '0',
        },
      },
      false: {},
    },
    mode: {
      default: {},
      topbar: {
        root: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          h: '12',
          w: '100%',
        },
      },
    },
  },
  defaultVariants: {
    isCollapsed: false,
    mode: 'default',
  },
});

export type SideNavVariants = RecipeVariantProps<typeof sideNavRecipe>;
