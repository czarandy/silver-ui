import {sva, type RecipeVariantProps} from 'styled-system/css';

export const codeBlockRecipe = sva({
  slots: [
    'root',
    'header',
    'headerTitle',
    'scroll',
    'body',
    'gutter',
    'gutterLine',
    'pre',
    'code',
    'line',
    'copyButtonFloating',
    'inlineCode',
    'inlineDivider',
  ],
  base: {
    root: {
      color: 'fg',
      overflow: 'hidden',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '3',
      px: '4',
      py: '2',
      borderBlockEndWidth: 'default',
      borderBlockEndStyle: 'solid',
      borderBlockEndColor: 'border',
    },
    headerTitle: {
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      color: 'fg.muted',
      fontFamily: 'mono',
      fontSize: 'xs',
      fontWeight: 'medium',
    },
    scroll: {
      overflow: 'auto',
    },
    body: {
      display: 'flex',
      minW: 'fit-content',
    },
    gutter: {
      flexShrink: 0,
      py: '3',
      ps: '4',
      pe: '3',
      borderInlineEndWidth: 'default',
      borderInlineEndStyle: 'solid',
      borderInlineEndColor: 'border',
      color: 'fg.muted',
      textAlign: 'end',
      userSelect: 'none',
    },
    gutterLine: {
      fontFamily: 'mono',
      lineHeight: '1.5rem',
    },
    pre: {
      m: 0,
      flex: 1,
      minW: 0,
    },
    code: {
      display: 'flex',
      flexDirection: 'column',
      color: 'fg',
      fontFamily: 'mono',
      tabSize: 2,
      whiteSpace: 'pre',
      wordBreak: 'normal',
      overflowWrap: 'normal',
    },
    line: {
      display: 'block',
      minH: '1.5rem',
      '&[data-highlighted]': {
        bg: 'bg.selected',
        mx: 'calc(var(--cb-padding) * -1)',
        px: 'var(--cb-padding)',
      },
    },
    copyButtonFloating: {
      position: 'absolute',
      top: '3',
      right: '3',
      zIndex: 1,
      // On hover-capable devices, hide until the block is hovered/focused (the
      // root reveals it via [data-cb-copy]). On touch devices it stays visible.
      '@media (hover: hover)': {
        opacity: 0,
        pointerEvents: 'none',
        transitionProperty: 'opacity',
        transitionDuration: 'fast',
        transitionTimingFunction: 'default',
        '@media (prefers-reduced-motion: reduce)': {
          transitionDuration: '0s',
        },
      },
    },
    inlineCode: {
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'pre',
      fontFamily: 'mono',
    },
    inlineDivider: {
      alignSelf: 'stretch',
      ms: '1.5',
    },
  },
  variants: {
    container: {
      card: {
        root: {
          position: 'relative',
          isolation: 'isolate',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'md',
          '&:hover [data-cb-copy], &:focus-within [data-cb-copy]': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        },
      },
      section: {
        root: {
          position: 'relative',
          isolation: 'isolate',
          display: 'flex',
          flexDirection: 'column',
          '&:hover [data-cb-copy], &:focus-within [data-cb-copy]': {
            opacity: 1,
            pointerEvents: 'auto',
          },
        },
      },
      inline: {
        root: {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1',
          maxWidth: '100%',
          ps: '2.5',
        },
      },
    },
    size: {
      sm: {
        code: {fontSize: 'xs', lineHeight: '1.5rem'},
        gutter: {fontSize: 'xs', lineHeight: '1.5rem'},
        inlineCode: {fontSize: 'xs', lineHeight: '1.5rem'},
      },
      md: {
        code: {fontSize: 'sm', lineHeight: '1.5rem'},
        gutter: {fontSize: 'sm', lineHeight: '1.5rem'},
        inlineCode: {fontSize: 'sm', lineHeight: '1.5rem'},
      },
    },
    isWrapped: {
      true: {
        code: {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          overflowWrap: 'anywhere',
        },
      },
    },
    hasFloatingCopy: {
      true: {
        code: {pe: '12'},
      },
    },
  },
  defaultVariants: {
    container: 'card',
    size: 'md',
    isWrapped: false,
    hasFloatingCopy: false,
  },
});

export type CodeBlockVariants = RecipeVariantProps<typeof codeBlockRecipe>;
