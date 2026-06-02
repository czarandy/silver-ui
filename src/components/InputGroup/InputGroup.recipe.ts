import {cva, type RecipeVariantProps} from 'styled-system/css';
import type {InputSize, InputStatusType} from '../Field';

const addonSelector = '& > [data-silver-input-group-text]';
const controlSelector = '& > :not([data-silver-input-group-text])';
const itemSelector = '& > *';

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
    [`${itemSelector}:not(:first-child)`]: {
      marginInlineStart: '-1px',
    },
    [`${itemSelector}:first-child`]: {
      borderStartStartRadius: 'md',
      borderEndStartRadius: 'md',
    },
    [`${itemSelector}:last-child`]: {
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
