import type {ButtonVariant} from 'components/Button/Button.types';
import {cva, sva, type RecipeVariantProps} from 'styled-system/css';
import {token} from 'styled-system/tokens';

const primaryBg = `var(--silver-button-primary-bg, ${token.var('colors.primary')})`;
const primaryFg = `var(--silver-button-primary-fg, ${token.var('colors.fg.onPrimary')})`;
const primaryBgHover = `var(--silver-button-primary-bg-hover, ${token.var('colors.primary.hover')})`;
const primaryBgActive = `var(--silver-button-primary-bg-active, ${token.var('colors.primary.active')})`;
const focusColor = `var(--silver-button-focus-color, ${token.var('colors.primary')})`;

/**
 * Shared Button surface treatments. Composite controls can reuse these raw
 * styles while keeping their own layout and focus-within behavior.
 */
export const buttonSurfaceRecipe = cva({
  variants: {
    variant: {
      primary: {
        bg: primaryBg,
        color: primaryFg,
        _hover: {bg: primaryBgHover},
        _active: {bg: primaryBgActive},
      },
      secondary: {
        bg: 'surface.gray',
        color: 'fg',
        _hover: {bg: 'surface.gray.hover'},
        _active: {bg: 'surface.gray.hover'},
      },
      ghost: {
        color: 'fg',
        bg: 'transparent',
        _hover: {bg: 'bg.ghost.hover'},
        _active: {bg: 'bg.ghost.active'},
      },
      destructive: {
        bg: 'destructive',
        color: 'destructive.fg',
        _hover: {bg: 'destructive.hover'},
        _active: {bg: 'destructive.active'},
        _focusVisible: {
          outlineColor: 'destructive',
        },
      },
      onSolid: {
        color: 'inherit',
        bg: 'transparent',
        _hover: {bg: 'color-mix(in srgb, currentColor 15%, transparent)'},
        _active: {bg: 'color-mix(in srgb, currentColor 20%, transparent)'},
        _focusVisible: {
          outlineColor: 'currentColor',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'secondary',
  },
});

type ButtonSurfaceStyles = {
  bg: string;
  color: string;
  _active: {bg: string};
  _focusVisible?: {outlineColor: string};
  _hover: {bg: string};
};

/**
 * Returns a narrowly typed raw surface so other recipes can compose it
 * without expanding every SystemStyleObject property into their public type.
 */
export function getButtonSurfaceStyles(
  variant: ButtonVariant,
): ButtonSurfaceStyles {
  return buttonSurfaceRecipe.raw({variant}) as ButtonSurfaceStyles;
}

export const buttonRecipe = sva({
  slots: [
    'root',
    'content',
    'icon',
    'label',
    'startContent',
    'endContent',
    'loadingIndicator',
  ],
  base: {
    root: {
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 0,
      borderStyle: 'none',
      fontFamily: 'body',
      fontWeight: 'medium',
      cursor: 'pointer',
      transitionProperty: 'background-color, color, opacity, transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      userSelect: 'none',
      lineHeight: 'tight',
      textDecoration: 'none',
      whiteSpace: 'nowrap',
      _active: {
        transform: 'scale(0.98)',
      },
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'none',
        transform: 'none',
      },
      '&[aria-disabled="true"]': {
        opacity: 0.5,
        cursor: 'not-allowed',
        pointerEvents: 'auto',
        transform: 'none',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: focusColor,
        outlineOffset: 'focusOffsetLoose',
      },
    },
    content: {
      display: 'contents',
    },
    icon: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },
    label: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      minW: 0,
      // The label is a (blockified) flex item, so `overflow: hidden` clips it to
      // its line box. With a tight line-height that crops descenders (e.g. the
      // "g" in "changes"), so pad the clip box vertically and cancel the padding
      // with a negative margin to keep layout unchanged.
      py: '0.25em',
      mt: '-0.35em',
      mb: '-0.25em',
    },
    startContent: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'inherit',
    },
    endContent: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'inherit',
    },
    loadingIndicator: {
      display: 'inline-flex',
      alignItems: 'center',
      color: 'inherit',
    },
  },
  variants: {
    variant: {
      primary: {
        root: getButtonSurfaceStyles('primary'),
      },
      secondary: {
        root: getButtonSurfaceStyles('secondary'),
      },
      ghost: {
        root: getButtonSurfaceStyles('ghost'),
      },
      destructive: {
        root: getButtonSurfaceStyles('destructive'),
      },
      onSolid: {
        root: getButtonSurfaceStyles('onSolid'),
      },
    },
    size: {
      sm: {
        root: {
          h: 'component.sm',
          px: 'component.sm',
          fontSize: 'component.sm',
          gap: '1.5',
          borderRadius: 'component.sm',
          '--button-icon-size': 'var(--silver-sizes-icon-sm)',
        },
      },
      md: {
        root: {
          h: 'component.md',
          px: '3',
          fontSize: 'component.md',
          gap: '2',
          borderRadius: 'component.md',
          '--button-icon-size': 'var(--silver-sizes-icon-md)',
        },
      },
      lg: {
        root: {
          h: 'component.lg',
          px: '4',
          fontSize: 'component.lg',
          gap: '2',
          borderRadius: 'component.lg',
          '--button-icon-size': 'var(--silver-sizes-icon-lg)',
        },
      },
    },
    iconOnly: {
      true: {
        root: {
          aspectRatio: 'square',
          px: 0,
        },
      },
      false: {},
    },
  },
  defaultVariants: {
    variant: 'secondary',
    size: 'md',
    iconOnly: false,
  },
});

export type ButtonVariants = RecipeVariantProps<typeof buttonRecipe>;
