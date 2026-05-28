import {useMemo, type CSSProperties, type Ref} from 'react';
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
   * down, left, right, plus.
   */
  keys: string;
  /**
   * Ref forwarded to the root element.
   */
  ref?: Ref<HTMLElement>;
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
    verticalAlign: 'bottom',
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
  plus: '+',
  right: '→',
  shift: '⇧',
  tab: '⇥',
  up: '↑',
};

const keyLabel: Record<string, string> = {
  alt: 'Alt',
  backspace: 'Backspace',
  ctrl: 'Control',
  down: 'Down Arrow',
  enter: 'Enter',
  escape: 'Escape',
  left: 'Left Arrow',
  plus: 'Plus',
  right: 'Right Arrow',
  shift: 'Shift',
  tab: 'Tab',
  up: 'Up Arrow',
};

let cachedIsMac: boolean | undefined;

function detectMac(): boolean {
  if (cachedIsMac !== undefined) {
    return cachedIsMac;
  }

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
    cachedIsMac = /mac/i.test(String(userAgentData.platform));
  } else {
    cachedIsMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
  }

  return cachedIsMac;
}

export function resetPlatformCache(): void {
  cachedIsMac = undefined;
}

function getKeyDisplay(key: string, isMac: boolean): string {
  if (key === 'mod') {
    return isMac ? '⌘' : 'Ctrl';
  }
  return keyDisplay[key] ?? key.toUpperCase();
}

function getKeyLabel(key: string, isMac: boolean): string {
  if (key === 'mod') {
    return isMac ? 'Command' : 'Control';
  }
  return keyLabel[key] ?? key.toUpperCase();
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
  const isMac = detectMac();
  const {keyedParts, ariaLabel} = useMemo(() => {
    const parts = keys
      .split('+')
      .map(key => key.trim().toLowerCase())
      .filter(Boolean);

    if (process.env.NODE_ENV !== 'production' && parts.length === 0) {
      console.warn(
        'Kbd: `keys` prop resolved to zero keys. Check the value passed to `keys`.',
      );
    }

    const keyCounts = new Map<string, number>();
    return {
      keyedParts: parts.map(key => {
        const count = (keyCounts.get(key) ?? 0) + 1;
        keyCounts.set(key, count);
        return {id: `${key}-${count}`, display: getKeyDisplay(key, isMac)};
      }),
      ariaLabel: parts.map(key => getKeyLabel(key, isMac)).join('+'),
    };
  }, [keys, isMac]);

  return (
    <kbd
      aria-label={ariaLabel}
      className={cx(styles.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {keyedParts.map(part => (
        <kbd className={styles.key} key={part.id}>
          {part.display}
        </kbd>
      ))}
    </kbd>
  );
}

Kbd.displayName = 'Kbd';
