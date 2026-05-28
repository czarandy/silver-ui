import type {Meta, StoryObj} from '@storybook/react-vite';
import {css} from 'styled-system/css';
import {Text} from '../Text';
import {Kbd} from './Kbd';

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
