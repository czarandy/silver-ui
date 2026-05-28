import {
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react';
import {AccordionContext, type AccordionContextValue} from './AccordionContext';

export interface AccordionProps {
  children: ReactNode;
  className?: string;
  'data-testid'?: string;
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  ref?: Ref<HTMLDivElement>;
  style?: CSSProperties;
  type?: 'single' | 'multiple';
  value?: string | string[];
}

function normalizeToArray(value: string | string[] | undefined): string[] {
  if (value == null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

export function Accordion({
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
  const [internalValue, setInternalValue] = useState<string[]>(() =>
    normalizeToArray(defaultValue),
  );

  const openValues = isControlled
    ? normalizeToArray(controlledValue)
    : internalValue;

  const isOpen = useCallback(
    (itemValue: string) => openValues.includes(itemValue),
    [openValues],
  );

  const toggle = useCallback(
    (itemValue: string) => {
      let nextValues: string[];

      if (type === 'single') {
        nextValues = openValues.includes(itemValue) ? [] : [itemValue];
      } else {
        nextValues = openValues.includes(itemValue)
          ? openValues.filter(v => v !== itemValue)
          : [...openValues, itemValue];
      }

      if (!isControlled) {
        setInternalValue(nextValues);
      }

      if (onChange) {
        if (type === 'single') {
          onChange(nextValues[0] ?? '');
        } else {
          onChange(nextValues);
        }
      }
    },
    [type, openValues, isControlled, onChange],
  );

  const contextValue = useMemo<AccordionContextValue>(
    () => ({isOpen, toggle}),
    [isOpen, toggle],
  );

  return (
    <AccordionContext value={contextValue}>
      <div
        className={className}
        data-testid={dataTestId}
        ref={ref}
        style={style}>
        {children}
      </div>
    </AccordionContext>
  );
}

Accordion.displayName = 'Accordion';
