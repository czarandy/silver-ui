import {useSyncExternalStore, type CSSProperties, type Ref} from 'react';
import {css} from 'styled-system/css';
import {cx} from '../../internal/cx';

export interface KbdProps {
  /**
   * Additional CSS class names applied to the root element.
   */
  className?: string;
  /**
   * Test ID applied to the root element.
   */
  'data-testid'?: string;
  /**
   * Keyboard shortcut string. Use "+" to separate keys.
   *
   * Special keys: mod, ctrl, alt, shift, enter, backspace, escape, tab, up,
   * down, left, right.
   */
  keys: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLSpanElement>;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

const styles = {
  root: css({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1',
    flexShrink: 0,
  }),
  key: css({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minW: '5',
    h: '5',
    px: '1',
    borderRadius: 'sm',
    bg: 'bg.subtle',
    borderBottomWidth: '2px',
    borderBottomStyle: 'solid',
    borderBottomColor: 'border',
    color: 'fg.muted',
    fontFamily: 'body',
    fontSize: 'xs',
    fontWeight: 'medium',
    lineHeight: 'none',
    userSelect: 'none',
  }),
} as const;

const keyDisplay: Record<string, string> = {
  alt: '⌥',
  backspace: '⌫',
  ctrl: '⌃',
  down: '↓',
  enter: '↵',
  escape: 'Esc',
  left: '←',
  right: '→',
  shift: '⇧',
  tab: '⇥',
  up: '↑',
};

function subscribeToPlatformChanges(): () => void {
  return () => {};
}

function getServerPlatformSnapshot(): boolean {
  return false;
}

function detectMac(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgentData =
    'userAgentData' in navigator ? navigator.userAgentData : null;
  if (
    userAgentData != null &&
    typeof userAgentData === 'object' &&
    'platform' in userAgentData
  ) {
    return /mac/i.test(String(userAgentData.platform));
  }

  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

function getKeyDisplay(key: string, isMac: boolean): string {
  if (key === 'mod') {
    return isMac ? '⌘' : 'Ctrl';
  }
  return keyDisplay[key] ?? key.toUpperCase();
}

/**
 * Displays keyboard shortcuts as styled key badges.
 */
export function Kbd({
  className,
  'data-testid': dataTestId,
  keys,
  ref,
  style,
}: KbdProps): React.JSX.Element {
  const isMac = useSyncExternalStore(
    subscribeToPlatformChanges,
    detectMac,
    getServerPlatformSnapshot,
  );
  const parts = keys
    .split('+')
    .map(key => key.trim().toLowerCase())
    .filter(Boolean);
  const keyCounts = new Map<string, number>();
  const keyedParts = parts.map(key => {
    const count = (keyCounts.get(key) ?? 0) + 1;
    keyCounts.set(key, count);
    return {id: `${key}-${count}`, key};
  });

  return (
    <span
      aria-hidden="true"
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {keyedParts.map(part => (
        <kbd className={styles.key} key={part.id}>
          {getKeyDisplay(part.key, isMac)}
        </kbd>
      ))}
    </span>
  );
}

Kbd.displayName = 'Kbd';
