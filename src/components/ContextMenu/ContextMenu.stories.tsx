import type {Meta, StoryObj} from '@storybook/react-vite';
import {Copy, Download, Pencil, Trash} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Badge} from 'components/Badge';
import {Card} from 'components/Card';
import {ContextMenu, ContextMenuItem} from 'components/ContextMenu/ContextMenu';
import {Divider} from 'components/Divider';
import {Kbd} from 'components/Kbd';
import {LayoutContent} from 'components/Layout/LayoutContent';
import {LayoutHeader} from 'components/Layout/LayoutHeader';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const styles = {
  edgeTarget: css({
    alignSelf: 'flex-end',
    mt: 'auto',
  }),
  positioningExample: css({
    display: 'flex',
    flexDirection: 'column',
    gap: '3',
  }),
  scrollContent: css({
    display: 'flex',
    flexDirection: 'column',
    minH: '160',
    minW: '160',
    p: '4',
  }),
  scrollRegion: css({
    h: '80',
    overflow: 'auto',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'border',
    borderRadius: 'md',
    bg: 'bg.subtle',
  }),
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

function GrowingMenuContent(): React.JSX.Element {
  const [hasGrown, setHasGrown] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setHasGrown(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <ContextMenuItem icon={Pencil} label="Rename" />
      <ContextMenuItem icon={Copy} label="Duplicate" />
      {hasGrown ? (
        <>
          <Divider />
          <ContextMenuItem label="Move to project" />
          <ContextMenuItem label="Share link" />
          <ContextMenuItem icon={Download} label="Export archive" />
          <ContextMenuItem icon={Trash} label="Delete" />
        </>
      ) : null}
    </>
  );
}

function PositioningAndScrollExample(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.positioningExample}>
      <Text color="secondary" type="supporting">
        Scroll to the bottom-right target and right-click it. Scrolling this
        region again dismisses the menu. If left open, the menu grows after a
        moment so its edge flipping can be checked at narrow canvas sizes.
      </Text>
      <div className={styles.scrollRegion}>
        <div className={styles.scrollContent}>
          <Text color="secondary" type="supporting">
            Scroll down and right
          </Text>
          <div className={styles.edgeTarget}>
            <ContextMenu
              menuContent={
                isOpen ? (
                  <GrowingMenuContent />
                ) : (
                  <ContextMenuItem icon={Pencil} label="Rename" />
                )
              }
              onOpenChange={setIsOpen}>
              <div className={styles.target}>
                <Text as="span" type="body">
                  Right-click near the edge
                </Text>
              </div>
            </ContextMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

const meta = {
  title: 'Components/ContextMenu',
  component: ContextMenu,
} satisfies Meta<typeof ContextMenu>;

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  render: (): React.JSX.Element => (
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

export const TouchLongPress: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      items={[
        {icon: Pencil, label: 'Rename'},
        {icon: Copy, label: 'Duplicate'},
        {type: 'divider'},
        {icon: Trash, label: 'Delete'},
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Long-press this area on a touch device (or right-click)
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const WithDescriptions: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      items={[
        {
          description: 'Change the file name',
          icon: Pencil,
          label: 'Rename',
        },
        {
          description: 'Create an identical copy',
          icon: Copy,
          label: 'Duplicate',
        },
        {type: 'divider'},
        {
          description: 'Move to trash',
          icon: Trash,
          label: 'Delete',
        },
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click for actions with descriptions
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const WithShortcuts: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      menuContent={
        <>
          <ContextMenuItem
            endContent={<Kbd keys="mod+r" />}
            icon={Pencil}
            label="Rename"
          />
          <ContextMenuItem
            endContent={<Kbd keys="mod+d" />}
            icon={Copy}
            label="Duplicate"
          />
          <Divider />
          <ContextMenuItem
            endContent={<Kbd keys="backspace" />}
            icon={Trash}
            label="Delete"
          />
        </>
      }>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click for actions with shortcuts
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const WithDisabledItems: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      items={[
        {icon: Pencil, label: 'Rename'},
        {icon: Copy, isDisabled: true, label: 'Duplicate'},
        {type: 'divider'},
        {icon: Trash, isDisabled: true, label: 'Delete'},
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click — some actions disabled
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const Disabled: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      isDisabled
      items={[
        {icon: Pencil, label: 'Rename'},
        {icon: Copy, label: 'Duplicate'},
      ]}>
      <div className={styles.target}>
        <Text as="span" type="body">
          Right-click falls through to browser menu
        </Text>
      </div>
    </ContextMenu>
  ),
};

export const SizeVariants: Story = {
  render: (): React.JSX.Element => {
    const items = [
      {icon: Pencil, label: 'Rename'},
      {icon: Copy, label: 'Duplicate'},
      {type: 'divider' as const},
      {icon: Trash, label: 'Delete'},
    ];
    return (
      <div style={{display: 'flex', gap: '2rem'}}>
        <ContextMenu items={items} size="sm">
          <div className={styles.target}>
            <Text as="span" type="body">
              Small
            </Text>
          </div>
        </ContextMenu>
        <ContextMenu items={items} size="md">
          <div className={styles.target}>
            <Text as="span" type="body">
              Medium
            </Text>
          </div>
        </ContextMenu>
        <ContextMenu items={items} size="lg">
          <div className={styles.target}>
            <Text as="span" type="body">
              Large
            </Text>
          </div>
        </ContextMenu>
      </div>
    );
  },
};

export const Sections: Story = {
  render: (): React.JSX.Element => (
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

export const PositioningAndScroll: Story = {
  render: (): React.JSX.Element => <PositioningAndScrollExample />,
};

export const CardTrigger: Story = {
  render: (): React.JSX.Element => (
    <ContextMenu
      items={[
        {icon: Pencil, label: 'Edit'},
        {icon: Copy, label: 'Duplicate'},
        {type: 'divider'},
        {icon: Trash, label: 'Delete'},
      ]}>
      <Card style={{width: 360}}>
        <LayoutHeader
          endContent={<Badge color="blue" label="Active" />}
          title="Project Alpha"
        />
        <LayoutContent>
          <Text color="secondary" type="supporting">
            3 members · Last updated 2 hours ago. Right-click for options.
          </Text>
        </LayoutContent>
      </Card>
    </ContextMenu>
  ),
};
