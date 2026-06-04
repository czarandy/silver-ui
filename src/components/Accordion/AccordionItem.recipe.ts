import {sva, type RecipeVariantProps} from 'styled-system/css';

export const accordionItemRecipe = sva({
  slots: ['root', 'trigger', 'chevron', 'panel', 'panelInner'],
  base: {
    root: {
      w: '100%',
    },
    trigger: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      w: '100%',
      cursor: 'pointer',
      fontFamily: 'body',
      fontSize: 'lg',
      fontWeight: 'semibold',
      color: 'fg',
      textAlign: 'start',
      py: 0,
      _disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
      _focusVisible: {
        outlineWidth: 'focus',
        outlineStyle: 'solid',
        outlineColor: 'primary',
        outlineOffset: 'focusOffset',
        borderRadius: 'sm',
      },
    },
    chevron: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transitionProperty: 'transform',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      color: 'fg.muted',
    },
    panel: {
      display: 'grid',
      gridTemplateRows: '1fr',
      // `visibility` is transitioned alongside the rows so the content stays
      // readable while collapsing, then becomes `hidden` (removing it from the
      // a11y tree and tab order) once closed. The inline `visibility` style in
      // the component drives the open/closed value.
      transitionProperty: 'grid-template-rows, visibility',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01s',
      },
    },
    panelInner: {
      overflow: 'hidden',
      minH: 0,
      pt: '1',
    },
  },
  variants: {
    isOpen: {
      true: {
        chevron: {transform: 'rotate(180deg)'},
      },
      false: {
        panel: {gridTemplateRows: '0fr'},
      },
    },
  },
  defaultVariants: {
    isOpen: false,
  },
});

export type AccordionItemVariants = RecipeVariantProps<
  typeof accordionItemRecipe
>;
