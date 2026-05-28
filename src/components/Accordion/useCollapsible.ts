import {use, useState} from 'react';
import {AccordionContext} from './AccordionContext';

export interface CollapsibleConfig {
  defaultIsOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseCollapsibleOptions {
  isCollapsible?: boolean | CollapsibleConfig;
  value?: string;
}

export interface UseCollapsibleReturn {
  isOpen: boolean;
  toggle: () => void;
}

export function useCollapsible(
  options: UseCollapsibleOptions,
): UseCollapsibleReturn {
  const {isCollapsible, value} = options;

  const group = use(AccordionContext);
  const isControlledByGroup = group != null && value != null;

  const config: CollapsibleConfig | null =
    isCollapsible === true
      ? {}
      : isCollapsible === false || isCollapsible == null
        ? null
        : isCollapsible;

  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (isControlledByGroup) {
      return true;
    }
    if (config?.isOpen !== undefined) {
      return config.isOpen;
    }
    return config?.defaultIsOpen ?? true;
  });

  let isOpen: boolean;
  if (isControlledByGroup) {
    isOpen = group.isOpen(value);
  } else if (config?.isOpen !== undefined) {
    isOpen = config.isOpen;
  } else {
    isOpen = internalIsOpen;
  }

  const toggle = () => {
    if (isControlledByGroup) {
      group.toggle(value);
    } else if (config?.onOpenChange) {
      config.onOpenChange(!isOpen);
    } else {
      setInternalIsOpen(prev => !prev);
    }
  };

  return {isOpen, toggle};
}
