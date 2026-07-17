import type {Meta, StoryObj} from '@storybook/react-vite';
import {useCallback, useRef, useState, type KeyboardEvent} from 'react';
import {Button} from 'components/Button';
import {Kbd} from 'components/Kbd';
import {Text} from 'components/Text';
import {TextInput} from 'components/TextInput';
import useAnnounce from 'hooks/useAnnounce';
import useHotkey from 'hooks/useHotkey';
import useKeyboardHint from 'hooks/useKeyboardHint';
import useListFocus from 'hooks/useListFocus';
import useTypeahead from 'hooks/useTypeahead';
import {css} from 'styled-system/css';

const styles = {
  column: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    maxW: '96',
  }),
  row: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '2',
  }),
  toolbar: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1',
    p: '1',
    borderWidth: '1px',
    borderRadius: 'md',
    borderColor: 'border',
  }),
  listbox: css({
    display: 'flex',
    flexDirection: 'column',
    p: '1',
    borderWidth: '1px',
    borderRadius: 'md',
    borderColor: 'border',
    maxH: '80',
    overflowY: 'auto',
  }),
  option: css({
    px: '3',
    py: '2',
    textAlign: 'start',
    borderRadius: 'sm',
    cursor: 'pointer',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {outlineWidth: '2px', outlineStyle: 'solid'},
    '&[aria-selected="true"]': {bg: 'bg.subtle', fontWeight: 'medium'},
  }),
  command: css({
    px: '3',
    py: '2',
    borderRadius: 'sm',
    cursor: 'pointer',
    _hover: {bg: 'bg.subtle'},
    _focusVisible: {outlineWidth: '2px', outlineStyle: 'solid'},
    '&[aria-pressed="true"]': {bg: 'bg.subtle', fontWeight: 'medium'},
  }),
};

/**
 * The accessibility hooks published from `silver-ui/hooks`. They are the same
 * primitives the library's own components are built on, so consumers can build
 * custom widgets that behave identically.
 */
const meta = {
  title: 'Hooks/Accessibility',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const FRUITS = [
  'Apple',
  'Apricot',
  'Banana',
  'Blueberry',
  'Cherry',
  'Cranberry',
  'Date',
  'Elderberry',
];

function AnnounceDemo(): React.JSX.Element {
  const {announce, announcer} = useAnnounce();
  const [tags, setTags] = useState(['Design', 'Research', 'Engineering']);

  return (
    <div className={styles.column}>
      <Text type="supporting">
        Removing a tag announces it politely. Turn on a screen reader (or open
        the accessibility inspector) to hear the live region update — nothing
        visible changes beyond the tag disappearing.
      </Text>
      <div className={styles.row}>
        {tags.map(tag => (
          <Button
            key={tag}
            label={`Remove ${tag}`}
            onClick={() => {
              setTags(previous => previous.filter(item => item !== tag));
              announce(`Removed ${tag}`);
            }}
            size="sm"
            variant="secondary"
          />
        ))}
      </div>
      <div className={styles.row}>
        <Button
          label="Announce an error"
          onClick={() => announce('Could not save changes', 'assertive')}
          size="sm"
          variant="ghost"
        />
        <Button
          label="Reset"
          onClick={() => setTags(['Design', 'Research', 'Engineering'])}
          size="sm"
          variant="ghost"
        />
      </div>
      {announcer}
    </div>
  );
}

/**
 * `useAnnounce` renders a pair of visually hidden live regions — one polite,
 * one assertive — and returns an `announce` function that writes to them.
 * Announcing the same message twice in a row still produces two announcements.
 */
export const Announce: Story = {
  render: () => <AnnounceDemo />,
};

function HotkeyDemo(): React.JSX.Element {
  const [enabled, setEnabled] = useState(true);
  const [query, setQuery] = useState('');
  const [triggerCount, setTriggerCount] = useState(0);

  useHotkey('mod+k', () => setTriggerCount(count => count + 1), {
    enabled,
    preventDefault: true,
  });

  return (
    <div className={styles.column}>
      <Text type="supporting">
        Press <Kbd keys="mod+k" size="sm" /> outside the input to run the
        shortcut. The same keys are ignored while you type in the input because
        form elements are excluded by default.
      </Text>
      <TextInput
        label="Search"
        onChange={setQuery}
        placeholder="Focus here and try the shortcut"
        value={query}
      />
      <Text>
        Shortcut {enabled ? 'enabled' : 'disabled'} · Triggered {triggerCount}{' '}
        {triggerCount === 1 ? 'time' : 'times'}
      </Text>
      <Button
        label={enabled ? 'Disable shortcut' : 'Enable shortcut'}
        onClick={() => setEnabled(value => !value)}
        size="sm"
        variant="secondary"
      />
    </div>
  );
}

/**
 * `useHotkey` registers a global, IME-safe keyboard shortcut. Descriptors use
 * the same vocabulary as `Kbd`, including platform-aware `mod`, so the
 * displayed shortcut and the listener stay in sync.
 */
export const Hotkey: Story = {
  render: () => <HotkeyDemo />,
};

function ToolbarDemo(): React.JSX.Element {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('Bold');
  const commands = ['Bold', 'Italic', 'Underline', 'Strikethrough'];

  const getItems = useCallback(
    () =>
      Array.from(
        toolbarRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
      ),
    [],
  );
  const {handleKeyDown} = useListFocus({
    getItems,
    // Selection follows focus, so the tab stop tracks the arrow keys.
    onFocusItem: item => setSelected(item.textContent.trim()),
    orientation: 'horizontal',
  });

  return (
    <div className={styles.column}>
      <Text type="supporting">
        Tab once to enter the toolbar, then use the left and right arrow keys to
        move between commands. Focus wraps at both ends, and `Home`/`End` jump
        to either edge. Only the selected command is a tab stop.
      </Text>
      <div
        aria-label="Formatting"
        className={styles.toolbar}
        onKeyDown={handleKeyDown}
        ref={toolbarRef}
        role="toolbar">
        {commands.map(command => (
          <button
            aria-pressed={command === selected}
            className={styles.command}
            key={command}
            onClick={() => setSelected(command)}
            tabIndex={command === selected ? 0 : -1}
            type="button">
            {command}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * `useListFocus` moves DOM focus along a list with the arrow keys, `Home`, and
 * `End`. The caller keeps ownership of which item is the tab stop, since that
 * is usually the selected item rather than the focused one.
 *
 * `handleKeyDown` returns `true` when it consumed the key, so the caller can
 * fall through to its own handling otherwise.
 */
export const ListFocus: Story = {
  render: () => <ToolbarDemo />,
};

function KeyboardHintDemo(): React.JSX.Element {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState('Bold');
  const commands = ['Bold', 'Italic', 'Underline', 'Strikethrough'];

  const getItems = useCallback(
    () =>
      Array.from(
        toolbarRef.current?.querySelectorAll<HTMLElement>('button') ?? [],
      ),
    [],
  );
  const {handleKeyDown} = useListFocus({
    getItems,
    onFocusItem: item => setSelected(item.textContent.trim()),
    orientation: 'horizontal',
  });
  const hint = useKeyboardHint({orientation: 'horizontal'});

  return (
    <div className={styles.column}>
      <Text type="supporting">
        Tab into the toolbar to see the hint. It appears only for keyboard
        focus, so clicking a command never surfaces it, and it dismisses on the
        first arrow press, after three seconds, or when focus leaves.
      </Text>
      <Text type="supporting">
        Reload the story to see it again — a hint teaches once per instance.
      </Text>
      <div
        aria-label="Formatting"
        className={styles.toolbar}
        onBlur={hint.onBlur}
        onFocus={hint.onFocus}
        onKeyDown={event => {
          hint.onKeyDown(event);
          handleKeyDown(event);
        }}
        ref={toolbarRef}
        role="toolbar">
        {commands.map(command => (
          <button
            aria-pressed={command === selected}
            className={styles.command}
            key={command}
            onClick={() => setSelected(command)}
            tabIndex={command === selected ? 0 : -1}
            type="button">
            {command}
          </button>
        ))}
        {hint.hintElement}
      </div>
    </div>
  );
}

/**
 * `useKeyboardHint` shows an ephemeral "← → to navigate" badge the first time a
 * roving-tabindex widget receives keyboard focus. A single Tab stop is good for
 * keyboard users but hides the fact that the arrow keys do anything, and this
 * closes that gap without adding permanent chrome.
 *
 * It renders in the top layer, so an overflow container never clips it, and it
 * is `aria-hidden`: screen reader users are already told the role and position
 * of the item they land on. Pass the same `orientation` you gave `useListFocus`.
 */
export const KeyboardHint: Story = {
  render: () => <KeyboardHintDemo />,
};

function TypeaheadDemo(): React.JSX.Element {
  const listRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(FRUITS[0]);

  const getItems = useCallback(
    () =>
      Array.from(
        listRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
      ),
    [],
  );
  const {
    getActiveIndex,
    getItems: getOptions,
    handleKeyDown,
  } = useListFocus({
    getItems,
  });
  const handleTypeahead = useTypeahead<HTMLElement>({
    getActiveIndex,
    getItems: getOptions,
    getLabel: option => option.textContent,
    onMatch: option => option.focus(),
  });

  const handleListKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (handleKeyDown(event)) {
      return;
    }
    handleTypeahead(event);
  };

  return (
    <div className={styles.column}>
      <Text type="supporting">
        Focus the list and type. A single character jumps to the next option
        starting with it, pressing the same character again cycles through the
        rest, and typing several characters quickly ("bl") narrows the match.
        The search buffer resets after 500ms of silence.
      </Text>
      <div
        aria-label="Fruit"
        className={styles.listbox}
        onKeyDown={handleListKeyDown}
        ref={listRef}
        role="listbox">
        {FRUITS.map(fruit => (
          <div
            aria-selected={fruit === selected}
            className={styles.option}
            key={fruit}
            onClick={() => setSelected(fruit)}
            onFocus={() => setSelected(fruit)}
            role="option"
            tabIndex={fruit === selected ? 0 : -1}>
            {fruit}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * `useTypeahead` implements the WAI-ARIA typeahead pattern: characters typed in
 * quick succession build a search string, repeated presses of one character
 * cycle through the items starting with it, and the search wraps around the end
 * of the list.
 *
 * It pairs naturally with `useListFocus` — try each key handler in turn and let
 * the first one that consumes the key win.
 */
export const Typeahead: Story = {
  render: () => <TypeaheadDemo />,
};
