import {sva, type RecipeVariantProps} from 'styled-system/css';

export const segmentedControlRecipe = sva({
  slots: ['root', 'item', 'icon'],
  base: {
    root: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5',
      p: '0.5',
      bg: 'surface.gray',
      borderRadius: 'md',
    },
    item: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1',
      borderWidth: 0,
      borderStyle: 'none',
      bg: 'transparent',
      color: 'fg.muted',
      cursor: 'pointer',
      fontFamily: 'body',
      fontWeight: 'medium',
      lineHeight: 'normal',
      transitionProperty: 'background-color, color, box-shadow',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      _hover: {
        bg: 'bg.subtle',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
      },
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
  },
  variants: {
    // The *root* carries the shared control height so the whole control lines
    // up with a Button; items fill what the root's padding leaves behind. Items
    // keep their own tighter `px` and `borderRadius`, which are inset values
    // rather than points on the `component.*` scale.
    size: {
      sm: {
        root: {h: 'component.sm'},
        item: {h: 'full', px: '2', borderRadius: 'sm', fontSize: 'component.sm'},
      },
      md: {
        root: {h: 'component.md'},
        item: {h: 'full', px: '3', borderRadius: 'sm', fontSize: 'component.md'},
      },
      lg: {
        root: {h: 'component.lg'},
        item: {h: 'full', px: '3', borderRadius: 'md', fontSize: 'component.lg'},
      },
    },
    layout: {
      hug: {},
      fill: {
        root: {display: 'flex', w: 'full'},
        item: {flex: 1},
      },
    },
    isSelected: {
      true: {
        item: {
          bg: 'bg',
          color: 'fg',
          fontWeight: 'semibold',
          boxShadow: 'sm',
          _hover: {
            bg: 'bg',
          },
        },
      },
      false: {},
    },
    isDisabled: {
      true: {
        root: {
          opacity: 0.5,
          pointerEvents: 'none',
        },
        item: {
          color: 'fg.disabled',
          cursor: 'default',
          _hover: {
            bg: 'transparent',
          },
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    size: 'md',
    layout: 'hug',
    isSelected: false,
    isDisabled: false,
  },
});

export type SegmentedControlVariants = RecipeVariantProps<
  typeof segmentedControlRecipe
>;
