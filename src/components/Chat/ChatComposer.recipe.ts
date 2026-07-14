import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatComposerRecipe = sva({
  slots: [
    'root',
    'body',
    'header',
    'headerStart',
    'headerEnd',
    'inputArea',
    'footer',
    'footerStart',
    'footerEnd',
    'statusBar',
  ],
  base: {
    root: {
      position: 'relative',
      zIndex: 0,
      isolation: 'isolate',
      display: 'flex',
      flexDirection: 'column',
    },
    body: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '3xl',
      bg: 'bg',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      cursor: 'text',
      boxShadow: 'sm',
      transitionProperty: 'box-shadow',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      _hover: {boxShadow: 'md'},
      _focusWithin: {boxShadow: 'md'},
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2',
      minH: '28px',
    },
    headerStart: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    headerEnd: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      marginInlineStart: 'auto',
      fontSize: 'sm',
      color: 'fg.muted',
    },
    inputArea: {
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '2',
    },
    footerStart: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    footerEnd: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
    },
    statusBar: {
      position: 'relative',
      zIndex: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      paddingInline: '4',
      fontFamily: 'body',
      fontSize: 'sm',
    },
  },
  variants: {
    density: {
      compact: {
        body: {p: '2', gap: '1'},
      },
      balanced: {
        body: {p: '3', gap: '2'},
      },
      spacious: {
        body: {p: '4', gap: '2'},
      },
    },
    // Only dims: the input and send button disable natively, and blocking
    // pointer events here would make the (intentionally enabled) stop button
    // unreachable by mouse while isStopShown.
    isDisabled: {
      true: {
        root: {opacity: 0.6},
      },
    },
    statusType: {
      error: {
        statusBar: {bg: 'surface.red', color: 'surface.red.fg'},
      },
      warning: {
        statusBar: {bg: 'surface.yellow', color: 'surface.yellow.fg'},
      },
    },
    // The status bar tucks behind the rounded body: it pads one block edge by
    // the body radius and pulls itself under the body by the same amount.
    statusPosition: {
      top: {
        statusBar: {
          paddingBlockStart: '3',
          paddingBlockEnd: 'calc(token(spacing.3) + token(radii.3xl))',
          marginBlockEnd: 'calc(-1 * token(radii.3xl))',
          borderTopLeftRadius: '3xl',
          borderTopRightRadius: '3xl',
        },
      },
      bottom: {
        statusBar: {
          paddingBlockStart: 'calc(token(spacing.3) + token(radii.3xl))',
          paddingBlockEnd: '3',
          marginBlockStart: 'calc(-1 * token(radii.3xl))',
          borderBottomLeftRadius: '3xl',
          borderBottomRightRadius: '3xl',
        },
      },
    },
  },
  defaultVariants: {
    density: 'balanced',
    isDisabled: false,
    statusPosition: 'bottom',
  },
});

export type ChatComposerVariants = RecipeVariantProps<
  typeof chatComposerRecipe
>;
