import {sva, type RecipeVariantProps} from 'styled-system/css';

export const chatScrollButtonRecipe = sva({
  slots: ['wrapper', 'pill', 'button'],
  base: {
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      paddingBlockEnd: '3',
    },
    pill: {
      contain: 'layout style',
      overflow: 'hidden',
      borderRadius: 'full',
      bg: 'bg',
      boxShadow: 'md',
      transitionProperty: 'opacity, max-width, visibility',
      transitionDuration: 'normal',
      transitionTimingFunction: 'default',
    },
    button: {
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    isVisible: {
      true: {
        pill: {opacity: 1, pointerEvents: 'auto'},
      },
      false: {
        // visibility keeps the hidden button out of the tab order and
        // accessibility tree while the opacity fade still transitions.
        pill: {opacity: 0, pointerEvents: 'none', visibility: 'hidden'},
      },
    },
    isExpanded: {
      true: {
        pill: {maxW: '240px'},
      },
      false: {
        pill: {maxW: '40px'},
      },
    },
  },
  defaultVariants: {
    isVisible: false,
    isExpanded: false,
  },
});

export type ChatScrollButtonVariants = RecipeVariantProps<
  typeof chatScrollButtonRecipe
>;
