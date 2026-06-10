import {sva, type RecipeVariantProps} from 'styled-system/css';

export const lightboxRecipe = sva({
  slots: [
    'dialog',
    'container',
    'mediaGroup',
    'mediaWrap',
    'image',
    'video',
    'caption',
    'close',
    'nav',
    'counter',
    'controlButton',
  ],
  base: {
    dialog: {
      position: 'fixed',
      inset: 0,
      w: '100dvw',
      h: '100dvh',
      maxW: 'none',
      maxH: 'none',
      m: 0,
      p: 0,
      borderWidth: 0,
      bg: 'transparent',
      overflow: 'hidden',
      outline: 'none',
      _backdrop: {
        bg: 'overlay.scrim.strong',
        backdropFilter: 'blur(2px)',
      },
    },
    container: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'full',
      h: 'full',
      p: '8',
    },
    mediaGroup: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      maxW: 'full',
      maxH: 'full',
      minH: 0,
    },
    mediaWrap: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      minH: 0,
      userSelect: 'none',
    },
    image: {
      display: 'block',
      maxW: '100%',
      maxH: 'calc(100dvh - 7rem)',
      objectFit: 'contain',
      pointerEvents: 'none',
      transitionProperty: 'transform',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0ms',
      },
    },
    video: {
      maxW: '100%',
      maxH: 'calc(100dvh - 7rem)',
      objectFit: 'contain',
      outline: 'none',
    },
    caption: {
      w: 'full',
      maxW: 'min(90dvw, 48rem)',
      px: '3',
      pt: '2',
      color: 'fg.onPrimary',
      fontFamily: 'body',
      fontSize: 'lg',
      lineHeight: 'normal',
      textAlign: 'center',
    },
    close: {
      position: 'absolute',
      top: '3',
      right: '3',
      zIndex: 1,
    },
    nav: {
      position: 'absolute',
      top: '50%',
      zIndex: 1,
      transform: 'translateY(-50%)',
    },
    counter: {
      position: 'absolute',
      top: '3',
      left: '3',
      zIndex: 1,
      color: 'fg.onPrimary',
      fontFamily: 'body',
      fontSize: 'md',
    },
    controlButton: {
      bg: 'overlay.scrim',
      color: 'fg.onPrimary',
      _hover: {
        bg: 'overlay.scrim.strong',
      },
      _active: {
        bg: 'overlay.scrim.strong',
      },
    },
  },
  variants: {
    // Media viewport cursor reflects the active zoom/pan interaction. A single
    // value keeps the precedence deterministic: dragging > zoomed > zoomable.
    cursor: {
      default: {},
      zoomable: {mediaWrap: {cursor: 'zoom-in'}},
      zoomed: {mediaWrap: {cursor: 'grab'}},
      dragging: {mediaWrap: {cursor: 'grabbing'}},
    },
    // While dragging, drop the transform transition so the image tracks the
    // pointer exactly instead of easing behind it.
    isDragging: {
      true: {image: {transitionProperty: 'none'}},
      false: {},
    },
    // Horizontal placement for the prev/next gallery navigation controls.
    position: {
      prev: {nav: {left: '3'}},
      next: {nav: {right: '3'}},
    },
  },
  defaultVariants: {
    cursor: 'default',
    isDragging: false,
  },
});

export type LightboxVariants = RecipeVariantProps<typeof lightboxRecipe>;
