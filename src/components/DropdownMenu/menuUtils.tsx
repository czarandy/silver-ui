/* eslint-disable @eslint-react/no-array-index-key */
'use client';
import {
  useCallback,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {Divider} from 'components/Divider';
import {
  DropdownMenuItem,
  MENU_ITEM_SELECTOR,
} from 'components/DropdownMenu/DropdownMenuItem';
import type {
  DropdownMenuItemData,
  DropdownMenuOption,
} from 'components/DropdownMenu/types';
import {Text} from 'components/Text';
import useListFocus from 'hooks/useListFocus';
import useTypeahead from 'hooks/useTypeahead';
import {isComposingEvent} from 'internal/isComposingEvent';
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
} as const;

/**
 * Shared styles for the element that holds a menu's items. Dividers get their
 * spacing here so a `<Divider />` passed as compound content matches the
 * data-driven `{type: 'divider'}`.
 */
export const menuListStyles = css.raw({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5',
  maxH: '80',
  overflowY: 'auto',
  p: '1',
  '& [role="separator"]': {my: '1'},
});

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
      return <Divider key={`divider-${index}`} />;
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
          {item.items.map(renderMenuItem)}
        </div>
      );
    }

    return renderMenuItem(item);
  });
}

function renderMenuItem(item: DropdownMenuItemData): React.JSX.Element {
  return (
    <DropdownMenuItem
      description={item.description}
      hasCloseOnSelect={item.hasCloseOnSelect}
      icon={item.icon}
      isDisabled={item.isDisabled}
      isSelected={item.isSelected}
      key={item.label}
      label={item.label}
      onClick={item.onClick}
      selectionMode={item.selectionMode}
      tooltip={item.tooltip}
    />
  );
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
      menuRef.current.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
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
      if (isComposingEvent(event)) {
        return;
      }

      switch (event.key) {
        case 'Tab':
          event.preventDefault();
          onClose();
          focusTargetRef?.current?.focus();
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
