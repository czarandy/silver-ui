import type {InputSize, InputStatusType} from 'components/Field';
import {cva, type RecipeVariantProps} from 'styled-system/css';

// Popover layers (native `popover` elements, e.g. a Select's menu) render inline
// as a sibling of the control they belong to rather than through a portal, so
// they must not be treated as group items. `:first-child`/`:last-child` are
// structural and would still resolve to the layer, so the edge radii are keyed
// off `nth-child(... of :not([popover]))` — the first/last *real* control.
const realItem = ':not([popover])';
const addonSelector = '& > [data-silver-input-group-text]';
const controlSelector = `& > :not([data-silver-input-group-text])${realItem}`;
const itemSelector = `& > *${realItem}`;
const firstItemSelector = `& > *:nth-child(1 of ${realItem})`;
const lastItemSelector = `& > *:nth-last-child(1 of ${realItem})`;

const statusStyles = {
  error: {
    borderColor: 'status.error.border',
    _focusWithin: {borderColor: 'status.error.border'},
  },
  success: {
    borderColor: 'status.success.border',
    _focusWithin: {borderColor: 'status.success.border'},
  },
  warning: {
    borderColor: 'status.warning.border',
    _focusWithin: {borderColor: 'status.warning.border'},
  },
} satisfies Record<InputStatusType, object>;

export const inputGroupRecipe = cva({
  base: {
    display: 'inline-flex',
    alignItems: 'stretch',
    isolation: 'isolate',
    maxW: 'full',
    [itemSelector]: {
      position: 'relative',
      borderRadius: 0,
    },
    [`${itemSelector}:not(:nth-child(1 of ${realItem}))`]: {
      marginInlineStart: '-1px',
    },
    [firstItemSelector]: {
      borderStartStartRadius: 'md',
      borderEndStartRadius: 'md',
    },
    [lastItemSelector]: {
      borderStartEndRadius: 'md',
      borderEndEndRadius: 'md',
    },
    [`${itemSelector}:focus-within`]: {
      zIndex: 1,
    },
    [controlSelector]: {
      flex: 1,
      minW: 0,
      h: 'full',
    },
    [addonSelector]: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      px: '3',
      borderWidth: 'default',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      bg: 'bg.subtle',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'normal',
      whiteSpace: 'nowrap',
    },
  },
  variants: {
    isDisabled: {
      false: {},
      true: {
        cursor: 'not-allowed',
        opacity: 0.55,
      },
    },
    size: {
      lg: {
        [addonSelector]: {
          minH: 'component.lg',
        },
      },
      md: {
        [addonSelector]: {
          minH: 'component.md',
        },
      },
      sm: {
        [addonSelector]: {
          minH: 'component.sm',
        },
      },
    },
    status: {
      error: {
        [addonSelector]: statusStyles.error,
        [controlSelector]: statusStyles.error,
      },
      success: {
        [addonSelector]: statusStyles.success,
        [controlSelector]: statusStyles.success,
      },
      warning: {
        [addonSelector]: statusStyles.warning,
        [controlSelector]: statusStyles.warning,
      },
    },
  },
  defaultVariants: {
    isDisabled: false,
    size: 'md',
  },
});

export type InputGroupVariants = RecipeVariantProps<typeof inputGroupRecipe>;
export type InputGroupSize = InputSize;
