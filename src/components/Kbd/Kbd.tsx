import {
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type Ref,
} from 'react';
import {kbdRecipe} from 'components/Kbd/Kbd.recipe';
import {cx} from 'internal/cx';

export type KbdSize = 'sm' | 'md' | 'lg';

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
   * Size of the key badges.
   *
   * @default 'md'
   */
  size?: KbdSize;
  /**
   * Inline styles applied to the root element.
   */
  style?: CSSProperties;
}

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

const subscribePlatform = (): (() => void) => () => {};

function getIsMacSnapshot(): boolean {
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

function getServerSnapshot(): boolean {
  return false;
}

function useIsMac(): boolean {
  return useSyncExternalStore(
    subscribePlatform,
    getIsMacSnapshot,
    getServerSnapshot,
  );
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
  size = 'md',
  style,
}: KbdProps): React.JSX.Element {
  const isMac = useIsMac();
  const {keyedParts, ariaLabel} = useMemo(() => {
    const parts = keys
      .split('+')
      .map(key => key.trim().toLowerCase())
      .filter(Boolean);

    if (process.env.NODE_ENV !== 'production' && parts.length === 0) {
      throw new Error(
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

  const classes = kbdRecipe({size});

  return (
    <kbd
      aria-label={ariaLabel}
      className={cx(classes.root, className)}
      data-testid={dataTestId}
      ref={ref}
      style={style}>
      {keyedParts.map(part => (
        <kbd className={classes.key} key={part.id}>
          {part.display}
        </kbd>
      ))}
    </kbd>
  );
}

Kbd.displayName = 'Kbd';
