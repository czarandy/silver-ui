import {cva, type RecipeVariantProps} from 'styled-system/css';
import type {InputSize, InputStatusType} from '../Field';

const addonSelector = '& > [data-silver-input-group-text]';
const controlRootSelector = '& > :not([data-silver-input-group-text])';
const controlWrapperSelector =
  '& > :not([data-silver-input-group-text]) > div:last-child > div:first-child';
const itemSelector = '& > *';

const groupedBorderStart = {
  borderBottomLeftRadius: 0,
  borderTopLeftRadius: 0,
};

const groupedBorderEnd = {
  borderBottomRightRadius: 0,
  borderTopRightRadius: 0,
};

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
    },
    [`${itemSelector}:not(:first-child)`]: {
      marginInlineStart: '-1px',
    },
    [`${itemSelector}:focus-within`]: {
      zIndex: 1,
    },
    [controlRootSelector]: {
      flex: 1,
      minW: 0,
    },
    [`${controlRootSelector} > div:last-child`]: {
      h: 'full',
    },
    [controlWrapperSelector]: {
      h: 'full',
      minW: 0,
    },
    [`& > :not(:first-child):not([data-silver-input-group-text]) > div:last-child > div:first-child`]:
      groupedBorderStart,
    [`& > :not(:last-child):not([data-silver-input-group-text]) > div:last-child > div:first-child`]:
      groupedBorderEnd,
    [addonSelector]: {
      display: 'inline-flex',
      alignItems: 'center',
      flexShrink: 0,
      px: '2',
      borderWidth: '1px',
      borderStyle: 'solid',
      borderColor: 'border.emphasized',
      borderRadius: 'md',
      bg: 'bg.subtle',
      color: 'fg.muted',
      fontFamily: 'body',
      fontSize: 'md',
      lineHeight: 'normal',
      whiteSpace: 'nowrap',
    },
    [`${addonSelector}:not(:first-child)`]: groupedBorderStart,
    [`${addonSelector}:not(:last-child)`]: groupedBorderEnd,
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
        [controlWrapperSelector]: statusStyles.error,
      },
      success: {
        [addonSelector]: statusStyles.success,
        [controlWrapperSelector]: statusStyles.success,
      },
      warning: {
        [addonSelector]: statusStyles.warning,
        [controlWrapperSelector]: statusStyles.warning,
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
