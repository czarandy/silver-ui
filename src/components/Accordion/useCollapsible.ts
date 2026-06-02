import {use, useState} from 'react';
import {AccordionContext} from './AccordionContext';

export interface CollapsibleConfig {
  isDefaultOpen?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export interface UseCollapsibleOptions {
  config?: CollapsibleConfig;
  value?: string;
}

export interface UseCollapsibleReturn {
  isOpen: boolean;
  toggle: () => void;
}

export function useCollapsible(
  options: UseCollapsibleOptions,
): UseCollapsibleReturn {
  const {config, value} = options;

  const group = use(AccordionContext);
  const isMissingGroupValue = group != null && value == null;
  const isControlledByGroup = group != null && value != null;

  if (process.env.NODE_ENV !== 'production') {
    if (isMissingGroupValue) {
      throw new Error(
        'AccordionItem: `value` prop is required when used inside an Accordion.',
      );
    }
  }

  const [internalIsOpen, setInternalIsOpen] = useState(() => {
    if (isControlledByGroup) {
      return true;
    }
    if (config?.isOpen !== undefined) {
      return config.isOpen;
    }
    return config?.isDefaultOpen ?? true;
  });

  let isOpen: boolean;
  if (isControlledByGroup) {
    isOpen = group.getIsOpen(value);
  } else if (isMissingGroupValue) {
    isOpen = false;
  } else if (config?.isOpen !== undefined) {
    isOpen = config.isOpen;
  } else {
    isOpen = internalIsOpen;
  }

  const toggle = () => {
    if (isControlledByGroup) {
      group.toggle(value);
    } else if (isMissingGroupValue) {
      return;
    } else if (config?.isOpen !== undefined) {
      config.onOpenChange?.(!isOpen);
    } else {
      setInternalIsOpen(prev => !prev);
      config?.onOpenChange?.(!isOpen);
    }
  };

  return {isOpen, toggle};
}
