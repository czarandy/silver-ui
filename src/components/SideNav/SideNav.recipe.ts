import {sva, type RecipeVariantProps} from 'styled-system/css';

export const sideNavRecipe = sva({
  slots: [
    'root',
    'stickyTop',
    'headerArea',
    'scrollable',
    'stickyBottom',
    'footerRow',
    'footerContent',
    'footerCollapseButton',
    'footerActions',
    'topbarFooter',
  ],
  base: {
    root: {
      position: 'relative',
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
    headerArea: {
      minW: 0,
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
      borderBlockStartWidth: 'default',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'border',
    },
    footerRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      w: '100%',
    },
    footerContent: {
      display: 'flex',
      alignItems: 'center',
      flex: 1,
      minW: 0,
    },
    footerCollapseButton: {
      display: 'flex',
      ms: 'auto',
    },
    footerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    topbarFooter: {
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
          w: '14',
        },
        scrollable: {
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        },
        footerRow: {
          flexDirection: 'column',
          alignItems: 'center',
        },
        footerContent: {
          flex: 'none',
        },
        footerCollapseButton: {
          ms: 0,
        },
        footerActions: {
          flexDirection: 'column',
          alignItems: 'center',
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
