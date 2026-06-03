/* eslint-disable @eslint-react/no-array-index-key */
import {useCallback, type KeyboardEvent, type ReactNode} from 'react';
import {css} from 'styled-system/css';
import {Divider} from '../Divider';
import {Text} from '../Text';
import {DropdownMenuItem} from './DropdownMenuItem';
import type {DropdownMenuOption} from './types';

export const menuStyles = {
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
  menuRef: React.RefObject<HTMLElement | null>,
  onClose: () => void,
): (event: KeyboardEvent<HTMLElement>) => void {
  const getMenuItems = useCallback(() => {
    if (menuRef.current == null) {
      return [];
    }
    return Array.from(
      menuRef.current.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ),
    );
  }, [menuRef]);

  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const menuItems = getMenuItems();
      if (menuItems.length === 0) {
        return;
      }
      const currentIndex = menuItems.findIndex(
        item => item === document.activeElement,
      );
      let nextIndex: number;

      switch (event.key) {
        case 'ArrowDown':
          nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % menuItems.length;
          break;
        case 'ArrowUp':
          nextIndex =
            currentIndex === -1
              ? menuItems.length - 1
              : (currentIndex - 1 + menuItems.length) % menuItems.length;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = menuItems.length - 1;
          break;
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
          if (event.key.length === 1) {
            const char = event.key.toLowerCase();
            const startIndex = currentIndex === -1 ? 0 : currentIndex + 1;
            for (let i = 0; i < menuItems.length; i++) {
              const index = (startIndex + i) % menuItems.length;
              const label = menuItems[index].textContent.trim().toLowerCase();
              if (label.startsWith(char)) {
                event.preventDefault();
                menuItems[index].focus();
                return;
              }
            }
          }
          return;
      }

      event.preventDefault();
      menuItems[nextIndex]?.focus();
    },
    [getMenuItems, onClose],
  );
}
