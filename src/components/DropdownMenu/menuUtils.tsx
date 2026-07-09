/* eslint-disable @eslint-react/no-array-index-key */
'use client';
import {
  useCallback,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {Divider} from 'components/Divider';
import {DropdownMenuItem} from 'components/DropdownMenu/DropdownMenuItem';
import type {DropdownMenuOption} from 'components/DropdownMenu/types';
import {Text} from 'components/Text';
import useListFocus from 'hooks/useListFocus';
import useTypeahead from 'hooks/useTypeahead';
import {css} from 'styled-system/css';

const menuStyles = {
  section: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5',
  }),
  heading: css({
    px: '2',
    py: '1',
    userSelect: 'none',
  }),
  divider: css({
    my: '1',
  }),
} as const;

export function formatMenuWidth(
  value: number | string | undefined,
): string | undefined {
  if (value == null) {
    return undefined;
  }
  return typeof value === 'number' ? `${value}px` : value;
}

export function renderMenuItems(
  items: ReadonlyArray<DropdownMenuOption>,
): ReactNode {
  return items.map((item, index) => {
    if ('type' in item && item.type === 'divider') {
      return (
        <Divider className={menuStyles.divider} key={`divider-${index}`} />
      );
    }

    if ('type' in item) {
      return (
        <div
          aria-label={item.title}
          className={menuStyles.section}
          key={`section-${item.title ?? index}`}
          role="group">
          {item.title != null ? (
            <Text
              as="span"
              className={menuStyles.heading}
              color="secondary"
              type="supporting">
              {item.title}
            </Text>
          ) : null}
          {item.items.map(sectionItem => (
            <DropdownMenuItem
              description={sectionItem.description}
              icon={sectionItem.icon}
              isDisabled={sectionItem.isDisabled}
              key={sectionItem.label}
              label={sectionItem.label}
              onClick={sectionItem.onClick}
            />
          ))}
        </div>
      );
    }

    return (
      <DropdownMenuItem
        description={item.description}
        icon={item.icon}
        isDisabled={item.isDisabled}
        key={item.label}
        label={item.label}
        onClick={item.onClick}
      />
    );
  });
}

export function useMenuKeyboard(
  menuRef: RefObject<HTMLElement | null>,
  onClose: () => void,
  focusTargetRef?: RefObject<HTMLElement | null>,
): (event: KeyboardEvent<HTMLElement>) => void {
  const getMenuItems = useCallback(() => {
    if (menuRef.current == null) {
      return [];
    }
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled):not([aria-disabled="true"])',
      ),
    );
  }, [menuRef]);

  const listFocus = useListFocus({getItems: getMenuItems});
  const handleTypeahead = useTypeahead<HTMLElement>({
    getActiveIndex: listFocus.getActiveIndex,
    getItems: listFocus.getItems,
    getLabel: item => item.textContent.trim(),
    onMatch: item => item.focus(),
  });

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          onClose();
          focusTargetRef?.current?.focus();
          return;
        case 'Escape':
          event.preventDefault();
          onClose();
          return;
        case 'Enter':
        case ' ':
          if (document.activeElement instanceof HTMLElement) {
            event.preventDefault();
            document.activeElement.click();
          }
          return;
        default:
          if (!listFocus.handleKeyDown(event)) {
            handleTypeahead(event);
          }
      }
    },
    [focusTargetRef, handleTypeahead, listFocus, onClose],
  );
}
