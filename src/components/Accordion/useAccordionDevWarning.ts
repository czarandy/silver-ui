import {useEffect, useRef} from 'react';

/**
 * Dev-only: warns when a controlled `value` array is recreated each render with
 * the same contents, which defeats the `openValues` memo and forces unnecessary
 * re-renders. Runs in an effect (not during render) so the ref reads/writes stay
 * pure, and the whole hook is inert in production.
 */
export function useAccordionDevWarning(
  controlledValue: string | string[] | null | undefined,
): void {
  const prevControlledArrayRef = useRef<ReadonlyArray<string> | undefined>(
    undefined,
  );
  const hasWarnedUnstableValueRef = useRef(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV === 'production' ||
      !Array.isArray(controlledValue)
    ) {
      return;
    }
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
  }, [controlledValue]);
}
