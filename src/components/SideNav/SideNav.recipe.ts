import {sva, type RecipeVariantProps} from 'styled-system/css';

export const sideNavRecipe = sva({
  slots: [
    'root',
    'stickyTop',
    'headerArea',
    'scrollable',
    'stickyBottom',
    'collapseButton',
    'footerRow',
    'footerIcons',
    'topbarIcons',
  ],
  base: {
    root: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      h: '100%',
      w: '260px',
      bg: 'inherit',
      overflow: 'visible',
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
      gap: '2',
      borderBlockStartWidth: 'default',
      borderBlockStartStyle: 'solid',
      borderBlockStartColor: 'border',
    },
    collapseButton: {
      position: 'absolute',
      insetBlockStart: '2.5',
      insetInlineEnd: 0,
      zIndex: 1,
      display: 'flex',
      transform: 'translateX(50%)',
      bg: 'bg',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border',
      borderRadius: 'full',
      boxShadow: 'sm',
      _rtl: {
        transform: 'translateX(-50%)',
      },
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
          w: '14',
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
    isCollapsible: {
      true: {
        headerArea: {
          minH: '8',
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
  compoundVariants: [
    {
      isCollapsed: false,
      isCollapsible: true,
      css: {
        headerArea: {
          pe: '2',
        },
      },
    },
  ],
  defaultVariants: {
    isCollapsed: false,
    isCollapsible: false,
    mode: 'default',
  },
});

export type SideNavVariants = RecipeVariantProps<typeof sideNavRecipe>;
