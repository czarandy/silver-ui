import type {Meta, StoryObj} from '@storybook/react-vite';
import {css} from 'styled-system/css';
import {Text} from '../Text';
import {Kbd} from './Kbd';
import {kbdRecipe} from './Kbd.recipe';

const styles = {
  list: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
    maxW: '80',
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '4',
  }),
} as const;

const styledKbd = css({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '1',
  flexShrink: 0,
  verticalAlign: 'bottom',
});

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: {
    keys: 'mod+k',
  },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className={styles.list}>
      <div className={styles.row}>
        <Text as="span" type="body">
          Small
        </Text>
        <Kbd keys="mod+k" size="sm" />
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Medium (default)
        </Text>
        <Kbd keys="mod+k" size="md" />
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Large
        </Text>
        <Kbd keys="mod+k" size="lg" />
      </div>
    </div>
  ),
};

export const SingleKey: Story = {
  args: {
    keys: 'escape',
  },
};

export const AllSpecialKeys: Story = {
  render: () => (
    <div className={styles.list}>
      {[
        ['mod', 'mod (⌘ on Mac, Ctrl elsewhere)'],
        ['ctrl', 'ctrl'],
        ['alt', 'alt'],
        ['shift', 'shift'],
        ['enter', 'enter'],
        ['backspace', 'backspace'],
        ['escape', 'escape'],
        ['tab', 'tab'],
        ['up', 'up'],
        ['down', 'down'],
        ['left', 'left'],
        ['right', 'right'],
        ['plus', 'plus'],
      ].map(([keys, label]) => (
        <div className={styles.row} key={keys}>
          <Text as="span" type="body">
            {label}
          </Text>
          <Kbd keys={keys} />
        </div>
      ))}
    </div>
  ),
};

export const PlatformAdaptive: Story = {
  render: () => (
    <div className={styles.list}>
      <div className={styles.row}>
        <Text as="span" type="body">
          Mac
        </Text>
        <kbd aria-label="Command+K" className={styledKbd}>
          <kbd className={kbdRecipe({size: 'md'}).key}>⌘</kbd>
          <kbd className={kbdRecipe({size: 'md'}).key}>K</kbd>
        </kbd>
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Non-Mac
        </Text>
        <kbd aria-label="Control+K" className={styledKbd}>
          <kbd className={kbdRecipe({size: 'md'}).key}>Ctrl</kbd>
          <kbd className={kbdRecipe({size: 'md'}).key}>K</kbd>
        </kbd>
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Live (your platform)
        </Text>
        <Kbd keys="mod+k" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'The `mod` key renders as ⌘ (Command) on Mac and Ctrl on other platforms.',
      },
    },
  },
};

export const Shortcuts: Story = {
  render: () => (
    <div className={styles.list}>
      <div className={styles.row}>
        <Text as="span" type="body">
          Open command palette
        </Text>
        <Kbd keys="mod+k" />
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Save
        </Text>
        <Kbd keys="mod+s" />
      </div>
      <div className={styles.row}>
        <Text as="span" type="body">
          Navigate
        </Text>
        <Kbd keys="up+down+enter" />
      </div>
    </div>
  ),
};

export const CustomStyle: Story = {
  args: {
    keys: 'mod+k',
    className: css({fontSize: 'lg'}),
    style: {opacity: 0.7},
  },
};

export const InlineWithText: Story = {
  render: () => (
    <Text as="p" type="body">
      Press <Kbd keys="mod+k" /> to open the command palette.
    </Text>
  ),
};
