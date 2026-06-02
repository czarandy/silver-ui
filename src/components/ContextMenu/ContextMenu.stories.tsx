import type {Meta, StoryObj} from '@storybook/react-vite';
import {Copy, Download, Pencil, Trash} from 'lucide-react';
import {css} from 'styled-system/css';
import {Divider} from '../Divider';
import {Text} from '../Text';
import {ContextMenu, ContextMenuItem} from './ContextMenu';

const styles = {
  target: css({
    display: 'grid',
    minH: '40',
    placeItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'border',
    borderRadius: 'md',
    bg: 'bg.subtle',
    color: 'fg',
    px: '6',
    py: '8',
  }),
} as const;

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: () => (
    <ContextMenu
      items={[
        {icon: Pencil, label: 'Rename'},
        {icon: Copy, label: 'Duplicate'},
        {type: 'divider'},
        {icon: Trash, label: 'Delete'},
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click this area
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const Sections: Story = {
  render: () => (
    <ContextMenu
      items={[
        {
          items: [
            {icon: Pencil, label: 'Rename'},
            {icon: Copy, label: 'Duplicate'},
          ],
          title: 'Edit',
          type: 'section',
        },
        {
          items: [{icon: Download, label: 'Export'}],
          title: 'Share',
          type: 'section',
        },
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click for grouped actions
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const CompoundContent: Story = {
  render: () => (
    <ContextMenu
      menuContent={
        <>
          <ContextMenuItem icon={Pencil} label="Rename" />
          <ContextMenuItem icon={Copy} label="Duplicate" />
          <Divider />
          <ContextMenuItem icon={Trash} label="Delete" />
        </>
      }>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click for custom content
        </Text>
      </div>
    </ContextMenu>
  ),
};
