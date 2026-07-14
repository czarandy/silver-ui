import {sva, type RecipeVariantProps} from 'styled-system/css';

export const keyboardHintRecipe = sva({
  slots: ['root', 'content', 'keys', 'label'],
  base: {
    /**
     * The popover element itself. It carries only the fade, for two reasons:
     *
     * - No `display`. The UA stylesheet hides a closed popover with
     *   `display: none`, and an author `display` here would win on cascade
     *   origin and pin the hint permanently open.
     * - No surface. `useLayer` resets the layer in Panda's lower-precedence
     *   recipe layer, so a utility surface could safely override it. The
     *   visible surface still lives on `content` to keep it separate from this
     *   positioning and transition wrapper.
     */
    root: {
      // A passive affordance must never intercept clicks meant for the control
      // it floats over.
      pointerEvents: 'none',
      // `display` and `overlay` are discrete properties; transitioning them
      // with `allow-discrete` keeps the hint painted for the length of the fade
      // out instead of snapping away the instant the popover closes.
      opacity: 0,
      transitionProperty: 'opacity, display, overlay',
      transitionDuration: 'fast',
      transitionTimingFunction: 'default',
      transitionBehavior: 'allow-discrete',
      '&:popover-open': {
        opacity: 1,
      },
      '@media (prefers-reduced-motion: reduce)': {
        transitionDuration: '0.01ms',
      },
    },
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.5',
      px: '2',
      py: '1.5',
      bg: 'bg',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border',
      borderRadius: 'md',
      boxShadow: 'lg',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'sm',
      lineHeight: 'none',
      whiteSpace: 'nowrap',
    },
    keys: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '1',
    },
    label: {
      display: 'inline-flex',
    },
  },
});

export type KeyboardHintVariants = RecipeVariantProps<
  typeof keyboardHintRecipe
>;
