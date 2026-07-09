'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {VisuallyHidden} from 'components/VisuallyHidden';

/**
 * How urgently a screen reader should interrupt to read an announcement.
 * `polite` waits for the user to be idle; `assertive` interrupts immediately
 * and should be reserved for errors and other time-critical messages.
 */
export type AnnouncePoliteness = 'assertive' | 'polite';

export interface UseAnnounceResult {
  /**
   * Announces `message` to assistive technology. Announcing the same message
   * twice in a row still produces two announcements.
   */
  announce: (message: string, politeness?: AnnouncePoliteness) => void;
  /**
   * The live regions to render. Must be rendered for `announce` to have any
   * effect, and must stay mounted for the lifetime of the announcing component
   * — screen readers only observe live regions that were present in the DOM
   * before the text changed.
   */
  announcer: ReactNode;
  /**
   * Empties both live regions without announcing anything.
   */
  clear: () => void;
}

const EMPTY_MESSAGES: Record<AnnouncePoliteness, string> = {
  assertive: '',
  polite: '',
};

/**
 * Announces dynamic messages to screen readers through visually hidden
 * `aria-live` regions.
 *
 * Render the returned `announcer` somewhere inside the component, then call
 * `announce` from event handlers when something happens that a sighted user can
 * see but a screen reader user cannot — an item was removed, a filter matched
 * no results, a background save finished.
 *
 * ```tsx
 * const {announce, announcer} = useAnnounce();
 *
 * return (
 *   <div>
 *     <button onClick={() => { remove(tag); announce(`Removed ${tag.label}`); }}>
 *       Remove
 *     </button>
 *     {announcer}
 *   </div>
 * );
 * ```
 */
const useAnnounce = (): UseAnnounceResult => {
  const [messages, setMessages] =
    useState<Record<AnnouncePoliteness, string>>(EMPTY_MESSAGES);
  const frameRef = useRef<number | null>(null);

  const cancelPendingAnnouncement = useCallback(() => {
    if (frameRef.current != null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  useEffect(() => cancelPendingAnnouncement, [cancelPendingAnnouncement]);

  const announce = useCallback(
    (message: string, politeness: AnnouncePoliteness = 'polite') => {
      cancelPendingAnnouncement();
      // Screen readers announce live regions on text *change*, so re-setting an
      // identical message is silent. Blank the region first and write the
      // message on the next frame to guarantee a change is observed.
      setMessages(previous =>
        previous[politeness] === ''
          ? previous
          : {...previous, [politeness]: ''},
      );
      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        setMessages(previous => ({...previous, [politeness]: message}));
      });
    },
    [cancelPendingAnnouncement],
  );

  const clear = useCallback(() => {
    cancelPendingAnnouncement();
    setMessages(EMPTY_MESSAGES);
  }, [cancelPendingAnnouncement]);

  // Both regions are always rendered, even while empty: a live region added to
  // the DOM at the same time as its text is typically not announced.
  const announcer = (
    <>
      <VisuallyHidden
        aria-atomic="true"
        aria-live="polite"
        as="div"
        role="status">
        {messages.polite}
      </VisuallyHidden>
      <VisuallyHidden
        aria-atomic="true"
        aria-live="assertive"
        as="div"
        role="alert">
        {messages.assertive}
      </VisuallyHidden>
    </>
  );

  return {announce, announcer, clear};
};

export default useAnnounce;
