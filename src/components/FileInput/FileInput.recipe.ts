import {sva, type RecipeVariantProps} from 'styled-system/css';

export const fileInputRecipe = sva({
  slots: ['surface', 'icon', 'fileName'],
  base: {
    surface: {
      display: 'flex',
      alignItems: 'center',
      gap: '2',
      px: '3',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      borderRadius: 'md',
      bg: 'bg',
      cursor: 'pointer',
      _hover: {borderColor: 'fg.muted'},
    },
    icon: {
      display: 'inline-flex',
      color: 'fg.muted',
    },
    fileName: {
      flex: 1,
      minW: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    mode: {
      input: {
        surface: {
          position: 'relative',
          zIndex: 1,
          transitionProperty: 'border-color, box-shadow, opacity',
          transitionDuration: 'fast',
          transitionTimingFunction: 'default',
          _focusWithin: {
            borderColor: 'primary',
            boxShadow: 'focus',
          },
        },
      },
      dropzone: {
        surface: {
          minH: '32',
          flexDirection: 'column',
          justifyContent: 'center',
          borderStyle: 'dashed',
          textAlign: 'center',
          '& > *': {flex: 'none'},
          // Focus lives on the visually-hidden file input, so the surface
          // reflects it via :focus-within (the input mode uses boxShadow).
          _focusWithin: {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
        },
      },
    },
    // Size only affects the input mode's height; the dropzone has a fixed
    // height, so the real styling lives in compoundVariants below.
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    // Status border/focus colors only apply in input mode (the dropzone
    // surface keeps its dashed border), so they live in compoundVariants.
    status: {
      warning: {},
      error: {},
      success: {},
    },
    isDisabled: {
      true: {
        surface: {cursor: 'not-allowed', opacity: 0.55},
      },
      false: {},
    },
    isDragOver: {
      true: {
        surface: {borderColor: 'primary', bg: 'bg.selected'},
      },
      false: {},
    },
  },
  compoundVariants: [
    {mode: 'input', size: 'sm', css: {surface: {minH: 'component.sm'}}},
    {mode: 'input', size: 'md', css: {surface: {minH: 'component.md'}}},
    {mode: 'input', size: 'lg', css: {surface: {minH: 'component.lg'}}},
    {
      mode: 'input',
      status: 'warning',
      css: {
        surface: {
          borderColor: 'status.warning.border',
          _hover: {borderColor: 'status.warning.borderHover'},
          _focusWithin: {
            borderColor: 'status.warning.border',
            boxShadow: 'focus.warning',
          },
        },
      },
    },
    {
      mode: 'input',
      status: 'error',
      css: {
        surface: {
          borderColor: 'status.error.border',
          _hover: {borderColor: 'status.error.borderHover'},
          _focusWithin: {
            borderColor: 'status.error.border',
            boxShadow: 'focus.error',
          },
        },
      },
    },
    {
      mode: 'input',
      status: 'success',
      css: {
        surface: {
          borderColor: 'status.success.border',
          _hover: {borderColor: 'status.success.borderHover'},
          _focusWithin: {
            borderColor: 'status.success.border',
            boxShadow: 'focus.success',
          },
        },
      },
    },
  ],
  defaultVariants: {
    mode: 'input',
    size: 'md',
    isDisabled: false,
    isDragOver: false,
  },
});

export type FileInputVariants = RecipeVariantProps<typeof fileInputRecipe>;
