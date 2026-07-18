'use client';

import {
  useCallback,
  useEffect,
  useRef,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import {Kbd} from 'components/Kbd';
import {keyboardHintRecipe} from 'hooks/useKeyboardHint.recipe';
import {useLayer} from 'internal/useLayer';

const classes = keyboardHintRecipe();

/**
 * Which arrow keys the hint advertises. Mirrors `ListFocusOrientation`, so a
 * composite widget can pass the same value it gives `useListFocus`.
 */
export type KeyboardHintOrientation = 'both' | 'horizontal' | 'vertical';

export interface UseKeyboardHintOptions {
  /**
   * How long the hint stays on screen before dismissing itself.
   * @default 3000
   */
  dismissAfterMs?: number;
  /**
   * Whether the hint may appear at all. Turn it off for widgets that cannot be
   * navigated right now, such as a disabled control.
   * @default true
   */
  isEnabled?: boolean;
  /**
   * Which arrows to draw: `horizontal` shows ← →, `vertical` shows ↑ ↓, and
   * `both` shows all four.
   * @default 'horizontal'
   */
  orientation?: KeyboardHintOrientation;
}

export interface UseKeyboardHintResult {
  /**
   * The hint itself. Render it unconditionally inside the container — it is a
   * top-layer popover that manages its own visibility, so it neither takes up
   * layout space nor needs to be conditionally mounted.
   */
  hintElement: ReactNode;
  /**
   * Attach to the container's `onBlur`. Dismisses the hint once focus leaves
   * the container.
   */
  onBlur: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Attach to the container's `onFocus`. Shows the hint the first time keyboard
   * focus enters the container.
   */
  onFocus: (event: FocusEvent<HTMLElement>) => void;
  /**
   * Attach to the container's `onKeyDown`. Dismisses the hint once the user
   * presses an arrow key, since they have found the affordance.
   */
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const ARROW_KEYS = new Set(['ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowUp']);

const HINT_KEYS: Record<KeyboardHintOrientation, ReadonlyArray<string>> = {
  both: ['left', 'right', 'up', 'down'],
  horizontal: ['left', 'right'],
  vertical: ['up', 'down'],
};

/**
 * Gap in pixels between the focused item and the hint.
 */
const HINT_OFFSET = 8;

/**
 * Shows an ephemeral "← → to navigate" hint the first time a roving-tabindex
 * widget receives keyboard focus, teaching sighted keyboard users that arrow
 * keys move within the group. Tab lands on a single item and the arrow keys are
 * otherwise undiscoverable.
 *
 * The hint dismisses on the first arrow press, after `dismissAfterMs`, or when
 * focus leaves the container, and does not come back for that instance. It only
 * appears for keyboard focus (`:focus-visible`), never for pointer users, and
 * it is `aria-hidden`: screen reader users are already told the role and
 * position of the item they land on.
 *
 * ```tsx
 * const hint = useKeyboardHint({orientation: 'horizontal'});
 *
 * <div
 *   onBlur={hint.onBlur}
 *   onFocus={hint.onFocus}
 *   onKeyDown={hint.onKeyDown}
 *   role="tablist">
 *   {children}
 *   {hint.hintElement}
 * </div>
 * ```
 */
const useKeyboardHint = ({
  dismissAfterMs = 3000,
  isEnabled = true,
  orientation = 'horizontal',
}: UseKeyboardHintOptions = {}): UseKeyboardHintResult => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDismissedRef = useRef(false);
  const isVisibleRef = useRef(false);

  const clearDismissTimeout = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const layer = useLayer();

  const dismiss = useCallback(() => {
    // Latching here is what makes the hint ephemeral: it teaches once, then
    // stays out of the way for the rest of this instance's life.
    isDismissedRef.current = true;
    isVisibleRef.current = false;
    clearDismissTimeout();
    layer.hide();
    layer.ref(null);
  }, [clearDismissTimeout, layer]);

  useEffect(() => clearDismissTimeout, [clearDismissTimeout]);

  const onFocus = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (isDismissedRef.current || !isEnabled) {
        return;
      }
      // Pointer users get no hint — they never needed the arrow keys.
      if (!event.target.matches(':focus-visible')) {
        return;
      }
      // Focus moving between items inside the container is not an entry, and
      // re-showing on every hop would make the hint anything but ephemeral.
      if (
        event.relatedTarget instanceof Node &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        return;
      }

      layer.ref(event.target);
      layer.show();
      isVisibleRef.current = true;
      clearDismissTimeout();
      timeoutRef.current = setTimeout(dismiss, dismissAfterMs);
    },
    [clearDismissTimeout, dismiss, dismissAfterMs, isEnabled, layer],
  );

  const onBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (!isVisibleRef.current) {
        return;
      }
      if (
        event.relatedTarget instanceof HTMLElement &&
        event.currentTarget.contains(event.relatedTarget)
      ) {
        // Focus stayed inside; follow it so the hint keeps pointing at the item
        // the user is actually on.
        layer.ref(event.relatedTarget);
        return;
      }
      dismiss();
    },
    [dismiss, layer],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (isVisibleRef.current && ARROW_KEYS.has(event.key)) {
        dismiss();
      }
    },
    [dismiss],
  );

  const hintElement = layer.render(
    <span className={classes.content}>
      <span className={classes.keys}>
        {HINT_KEYS[orientation].map(key => (
          <Kbd key={key} keys={key} size="sm" />
        ))}
      </span>
      <span className={classes.label}>to navigate</span>
    </span>,
    {
      alignment: 'start',
      // Decorative: assistive technology already announces the role and the
      // position of the focused item, and a bare div is not a legal child of
      // roles like `tablist`.
      'aria-hidden': true,
      className: classes.root,
      offsetY: HINT_OFFSET,
      placement: 'below',
    },
  );

  return {hintElement, onBlur, onFocus, onKeyDown};
};

export default useKeyboardHint;
