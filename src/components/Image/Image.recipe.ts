import {sva, type RecipeVariantProps} from 'styled-system/css';

export const imageRecipe = sva({
  slots: ['root', 'image', 'loading', 'fallback'],
  base: {
    root: {
      position: 'relative',
      display: 'block',
      w: 'full',
      h: 'full',
      overflow: 'hidden',
    },
    image: {
      display: 'block',
      w: 'full',
      h: 'full',
    },
    loading: {
      position: 'absolute',
      inset: 0,
    },
    fallback: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bg: 'surface.gray',
      color: 'fg.muted',
    },
  },
  variants: {
    isLoaded: {
      true: {
        image: {
          visibility: 'visible',
        },
      },
      false: {
        image: {
          visibility: 'hidden',
        },
      },
    },
    objectFit: {
      contain: {image: {objectFit: 'contain'}},
      cover: {image: {objectFit: 'cover'}},
      fill: {image: {objectFit: 'fill'}},
      none: {image: {objectFit: 'none'}},
      'scale-down': {image: {objectFit: 'scale-down'}},
    },
  },
  defaultVariants: {
    isLoaded: false,
    objectFit: 'cover',
  },
});

export type ImageVariants = RecipeVariantProps<typeof imageRecipe>;
