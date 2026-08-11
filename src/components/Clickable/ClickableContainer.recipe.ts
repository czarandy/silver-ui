import {sva, type RecipeVariantProps} from 'styled-system/css';

export const clickableContainerRecipe = sva({
  slots: ['root', 'control', 'overlay', 'content'],
  base: {
    root: {
      position: 'relative',
      isolation: 'isolate',
      borderRadius: 'inherit',
    },
    control: {
      position: 'absolute',
      insetBlockStart: 0,
      insetInlineStart: 0,
      w: '1px',
      h: '1px',
      p: 0,
      m: '-1px',
      overflow: 'hidden',
      clipPath: 'inset(50%)',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      borderWidth: 0,
      pointerEvents: 'none',
    },
    overlay: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transitionProperty: 'background-color',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
    },
    content: {
      position: 'relative',
      zIndex: 1,
      borderRadius: 'inherit',
    },
  },
  variants: {
    isInteractive: {
      true: {
        root: {
          cursor: 'pointer',
          '&:has([data-clickable-control]:focus-visible)': {
            outlineWidth: 'focus',
            outlineStyle: 'solid',
            outlineColor: 'primary',
            outlineOffset: 'focusOffset',
          },
          '&:not([data-clickable-disabled="true"]):hover > [data-clickable-overlay]':
            {
              bg: 'bg.ghost.hover',
            },
          '&:not([data-clickable-disabled="true"]):active > [data-clickable-overlay]':
            {
              bg: 'bg.ghost.active',
            },
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        root: {cursor: 'not-allowed'},
        content: {opacity: 0.5},
      },
      false: {},
    },
  },
  defaultVariants: {
    isInteractive: false,
    isDisabled: false,
  },
});

export type ClickableContainerVariants = RecipeVariantProps<
  typeof clickableContainerRecipe
>;
