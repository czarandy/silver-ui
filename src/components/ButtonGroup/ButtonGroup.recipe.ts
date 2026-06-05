import {cva, type RecipeVariantProps} from 'styled-system/css';

export const buttonGroupRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'stretch',
    isolation: 'isolate',
    '& :where(button, a)': {
      position: 'relative',
    },
    '& :where(button, a):focus-visible': {
      zIndex: 1,
    },
  },
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
        '& > :not(:first-child):is(button, a), & > :not(:first-child) :where(button, a):not([popover] *)':
          {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            borderInlineStartWidth: 'default',
            borderInlineStartStyle: 'solid',
            borderInlineStartColor: 'border',
          },
        // `:has(~ :not([popover]))` rather than `:not(:last-child)` so that a
        // trailing `[popover]` sibling (e.g. DropdownMenu's floating content,
        // which is display:none but still counts for :last-child) does not
        // strip the end radius from the last visible button in the group. The
        // `:not([popover] *)` on the descendant clause keeps these joins from
        // leaking onto buttons rendered inside a child's popover (menu items).
        '& > :has(~ :not([popover])):is(button, a), & > :has(~ :not([popover])) :where(button, a):not([popover] *)':
          {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
      },
      vertical: {
        flexDirection: 'column',
        '& > :not(:first-child):is(button, a), & > :not(:first-child) :where(button, a):not([popover] *)':
          {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderBlockStartWidth: 'default',
            borderBlockStartStyle: 'solid',
            borderBlockStartColor: 'border',
          },
        // See the horizontal note above: skip trailing `[popover]` siblings so
        // the last visible button keeps its bottom radius, and exclude popover
        // descendants so menu items don't inherit the group joins.
        '& > :has(~ :not([popover])):is(button, a), & > :has(~ :not([popover])) :where(button, a):not([popover] *)':
          {
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
          },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export type ButtonGroupVariants = RecipeVariantProps<typeof buttonGroupRecipe>;
