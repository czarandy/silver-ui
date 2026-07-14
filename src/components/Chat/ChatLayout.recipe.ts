import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatLayoutRecipe = sva({
  slots: [
    'root',
    'messageArea',
    'emptyState',
    'dockContainer',
    'blurLayer',
    'dock',
    'dockInner',
  ],
  base: {
    root: {
      position: 'relative',
      containerType: 'inline-size',
      minH: 0,
      flex: 1,
    },
    messageArea: {
      display: 'flex',
      flexDirection: 'column',
      marginInline: 'auto',
      minH: '100%',
      paddingBlockEnd: '6',
    },
    emptyState: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      minH: '200px',
    },
    dockContainer: {
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 0,
      isolation: 'isolate',
      pointerEvents: 'none',
    },
    blurLayer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      pointerEvents: 'none',
      backdropFilter: 'blur(12px)',
    },
    dock: {
      position: 'relative',
      zIndex: 1,
      pointerEvents: 'auto',
    },
    dockInner: {
      marginInline: 'auto',
    },
  },
  variants: {
    density: {
      compact: {
        messageArea: {maxW: '100%'},
        blurLayer: {
          h: '80px',
          maskImage: 'linear-gradient(to bottom, transparent, black 24px)',
        },
        dock: {paddingInline: '2', paddingBlockEnd: '2'},
        dockInner: {maxW: '100%'},
      },
      balanced: {
        messageArea: {maxW: '100%'},
        blurLayer: {
          h: '100px',
          maskImage: 'linear-gradient(to bottom, transparent, black 36px)',
        },
        dock: {paddingInline: '3', paddingBlockEnd: '3'},
        dockInner: {maxW: '100%'},
      },
      spacious: {
        messageArea: {maxW: '800px', paddingInline: '4'},
        blurLayer: {
          h: '120px',
          maskImage: 'linear-gradient(to bottom, transparent, black 48px)',
        },
        dock: {paddingInline: '4', paddingBlockEnd: '3'},
        dockInner: {maxW: '800px'},
      },
    },
    isSelfScrolling: {
      true: {
        root: {overflowY: 'auto', overflowX: 'hidden'},
        dockContainer: {position: 'sticky'},
      },
      false: {
        dockContainer: {position: 'fixed'},
      },
    },
  },
  defaultVariants: {
    density: 'balanced',
    isSelfScrolling: true,
  },
});

export type ChatLayoutVariants = RecipeVariantProps<typeof chatLayoutRecipe>;
