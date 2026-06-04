import {sva, type RecipeVariantProps} from 'styled-system/css';

export const thumbnailRecipe = sva({
  slots: [
    'root',
    'imageContainer',
    'imageButton',
    'image',
    'placeholder',
    'insetBorder',
    'remove',
    'overlay',
  ],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: 'column',
      w: '16',
      flexShrink: 0,
      isolation: 'isolate',
    },
    imageContainer: {
      position: 'relative',
      w: 'full',
      aspectRatio: '1',
      borderRadius: 'md',
      overflow: 'hidden',
      bg: 'surface.gray',
    },
    imageButton: {
      display: 'block',
      w: 'full',
      h: 'full',
      cursor: 'pointer',
      borderRadius: 'inherit',
      overflow: 'hidden',
    },
    image: {
      display: 'block',
      w: 'full',
      h: 'full',
      objectFit: 'cover',
    },
    placeholder: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      w: 'full',
      h: 'full',
      color: 'fg.muted',
    },
    insetBorder: {
      position: 'absolute',
      inset: 0,
      borderRadius: 'inherit',
      boxShadow: 'inset 0 0 0 1px token(colors.border.emphasized)',
      pointerEvents: 'none',
    },
    remove: {
      position: 'absolute',
      top: '1',
      right: '1',
      zIndex: 1,
      color: 'fg.onPrimary',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'overlay.scrim.subtle',
      borderRadius: 'inherit',
      zIndex: 1,
    },
  },
  variants: {
    isDisabled: {
      true: {
        root: {
          opacity: 0.5,
          pointerEvents: 'none',
        },
      },
    },
    isInteractive: {
      true: {
        imageContainer: {
          cursor: 'pointer',
          transitionProperty: 'opacity, box-shadow',
          transitionDuration: 'fast',
          transitionTimingFunction: 'default',
          _hover: {
            boxShadow: 'lg',
            opacity: 0.9,
          },
          _active: {
            opacity: 0.75,
          },
          '&:has(:focus-visible)': {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
    isInteractive: false,
  },
});

export type ThumbnailVariants = RecipeVariantProps<typeof thumbnailRecipe>;
