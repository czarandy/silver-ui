import {sva, type RecipeVariantProps} from 'styled-system/css';

export const breadcrumbItemRecipe = sva({
  slots: ['item', 'separator', 'content', 'link', 'icon'],
  base: {
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '1',
      m: 0,
      '--breadcrumb-separator-display': 'flex',
      _first: {
        '--breadcrumb-separator-display': 'none',
      },
    },
    separator: {
      display: 'var(--breadcrumb-separator-display)',
      alignItems: 'center',
      color: 'fg.muted',
      py: '1',
      userSelect: 'none',
    },
    content: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      minW: 0,
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
      minW: 0,
      p: 0,
      py: '1',
      borderWidth: 0,
      bg: 'transparent',
      color: 'fg.muted',
      cursor: 'pointer',
      font: 'inherit',
      textDecoration: 'none',
      _hover: {
        textDecoration: 'underline',
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
      flexShrink: 0,
    },
  },
  variants: {
    variant: {
      default: {
        item: {
          fontSize: 'sm',
          lineHeight: 'normal',
        },
      },
      supporting: {
        item: {
          fontSize: 'xs',
          lineHeight: 'normal',
        },
      },
    },
    isCurrent: {
      true: {},
    },
  },
  compoundVariants: [
    {
      variant: 'default',
      isCurrent: true,
      css: {content: {color: 'fg'}},
    },
    {
      variant: 'supporting',
      isCurrent: true,
      css: {content: {color: 'fg.muted'}},
    },
  ],
  defaultVariants: {
    variant: 'default',
  },
});

export type BreadcrumbItemVariants = RecipeVariantProps<
  typeof breadcrumbItemRecipe
>;
