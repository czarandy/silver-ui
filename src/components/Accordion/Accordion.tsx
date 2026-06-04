import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';
import {AccordionContext, type AccordionContextValue} from './AccordionContext';

/**
 * A container that coordinates multiple `AccordionItem` children so that
 * one (`type="single"`) or several (`type="multiple"`) can be open at a
 * time. For a standalone disclosure widget, use `Collapsible` instead.
 */
interface AccordionBaseProps {
  /**
   * Accessible label for the accordion group. Provide either `aria-label`
   * or `aria-labelledby`, not both.
   */
  'aria-label'?: string;
  /**
   * ID of an element that labels the accordion group. Provide either
   * `aria-label` or `aria-labelledby`, not both.
   */
  'aria-labelledby'?: string;
  /**
   * One or more `AccordionItem` elements.
   */
  children: ReactNode;
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLDivElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

export type AccordionProps =
  | (AccordionBaseProps & {
      /**
       * Item value that is open on initial render, or `null` for all
       * closed. Ignored when `value` is provided.
       */
      defaultValue?: string | null;
      /**
       * Called when the open item changes. Receives the item value string,
       * or `null` when all items are closed.
       */
      onChange?: (value: string | null) => void;
      /**
       * Only one item can be open at a time. This is the default.
       */
      type?: 'single';
      /**
       * Controls which item is open externally. Pass `null` to close all
       * items. When set, the component becomes controlled and `onChange`
       * should be provided.
       */
      value?: string | null;
    })
  | (AccordionBaseProps & {
      /**
       * Item values that are open on initial render. Ignored when `value` is
       * provided.
       */
      defaultValue?: string[];
      /**
       * Called when the set of open items changes. Receives an array of
       * open item values.
       */
      onChange?: (value: string[]) => void;
      /**
       * Multiple items can be open simultaneously.
       */
      type: 'multiple';
      /**
       * Controls which items are open externally. When set, the component
       * becomes controlled and `onChange` should be provided. Memoize array
       * values to avoid unnecessary re-renders.
       */
      value?: string[];
    });

function normalizeToSet(
  value: string | string[] | null | undefined,
): ReadonlySet<string> {
  if (value == null) {
    return new Set();
  }
  return new Set(Array.isArray(value) ? value : [value]);
}

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  }),
};

export function Accordion({
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledby,
  type = 'single',
  defaultValue,
  value: controlledValue,
  onChange,
  children,
  className,
  'data-testid': dataTestId,
  ref,
  style,
}: AccordionProps): React.JSX.Element {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<ReadonlySet<string>>(() =>
    normalizeToSet(defaultValue),
  );

  // Dev-only: warn when a controlled `value` array is recreated each render
  // with the same contents, which defeats the `openValues` memo and forces
  // unnecessary re-renders. These refs are read/written during render purely
  // for the diagnostic — they never affect render output — and the whole
  // block is inert in production.
  /* eslint-disable @eslint-react/refs -- diagnostic-only ref use, does not affect render output */
  const prevControlledArrayRef = useRef<ReadonlyArray<string> | undefined>(
    undefined,
  );
  const hasWarnedUnstableValueRef = useRef(false);
  if (process.env.NODE_ENV !== 'production') {
    if (Array.isArray(controlledValue)) {
      const prev = prevControlledArrayRef.current;
      if (
        !hasWarnedUnstableValueRef.current &&
        prev !== undefined &&
        prev !== controlledValue &&
        prev.length === controlledValue.length &&
        prev.every((item, i) => item === controlledValue[i])
      ) {
        hasWarnedUnstableValueRef.current = true;
        console.warn(
          'Accordion: the `value` array changed identity between renders but ' +
            'contains the same items. Memoize it (e.g. with `useMemo`) to ' +
            'avoid unnecessary re-renders of the accordion items.',
        );
      }
      prevControlledArrayRef.current = controlledValue;
    }
  }
  /* eslint-enable @eslint-react/refs */

  const openValues = useMemo(
    () => (isControlled ? normalizeToSet(controlledValue) : internalValue),
    [isControlled, controlledValue, internalValue],
  );

  const getIsOpen = useCallback(
    (itemValue: string) => openValues.has(itemValue),
    [openValues],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      let nextValues: ReadonlySet<string>;

      if (type === 'single') {
        nextValues = openValues.has(itemValue)
          ? new Set()
          : new Set([itemValue]);
      } else {
        const next = new Set(openValues);
        if (next.has(itemValue)) {
          next.delete(itemValue);
        } else {
          next.add(itemValue);
        }
        nextValues = next;
      }

      if (!isControlled) {
        setInternalValue(nextValues);
      }

      if (onChange) {
        const arr = [...nextValues];
        if (type === 'single') {
          (onChange as (value: string | null) => void)(arr[0] ?? null);
        } else {
          (onChange as (value: string[]) => void)(arr);
        }
      }
    },
    [type, openValues, isControlled, onChange],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({getIsOpen, toggle}),
    [getIsOpen, toggle],
  );

  return (
    <AccordionContext value={contextValue}>
      <div
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        className={cx(styles.root, className)}
        data-testid={dataTestId}
        ref={ref}
        role="group"
        style={style}>
        {children}
      </div>
    </AccordionContext>
  );
}

Accordion.displayName = 'Accordion';
