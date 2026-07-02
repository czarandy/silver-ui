'use client';

import {use, useCallback, useState} from 'react';
import {AccordionContext} from 'components/Accordion/AccordionContext';

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

  const configIsOpen = config?.isOpen;
  const onOpenChange = config?.onOpenChange;

  // Depend on the primitive config fields rather than the `config` object so
  // the toggle keeps a stable identity across renders (callers commonly build
  // a fresh `config` object each render). Re-checking `group`/`value` inside
  // the callback also gives TypeScript the non-null narrowing it needs.
  const toggle = useCallback(() => {
    if (group != null && value != null) {
      group.toggle(value);
    } else if (group != null) {
      // Inside a group but missing a `value` prop: nothing to toggle.
      return;
    } else if (configIsOpen !== undefined) {
      onOpenChange?.(!configIsOpen);
    } else {
      setInternalIsOpen(prev => !prev);
      onOpenChange?.(!isOpen);
    }
  }, [group, value, configIsOpen, onOpenChange, isOpen]);

  return {isOpen, toggle};
}
