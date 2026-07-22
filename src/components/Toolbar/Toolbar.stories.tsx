import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  Archive,
  ArrowLeft,
  Copy,
  Download,
  Filter,
  Plus,
  RefreshCw,
  Scissors,
  Settings,
  Trash2,
} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {
  SegmentedControl,
  SegmentedControlItem,
} from 'components/SegmentedControl';
import {Select} from 'components/Select';
import {Tab, Tabs} from 'components/Tabs';
import {Text} from 'components/Text';
import {TextInput} from 'components/TextInput';
import {Toolbar} from 'components/Toolbar/Toolbar';
import {css} from 'styled-system/css';

const meta: Meta<typeof Toolbar> = {
  title: 'Components/Toolbar',
  component: Toolbar,
  args: {
    label: 'Actions',
  },
  argTypes: {
    gap: {
      control: {type: 'select'},
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
    },
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const columnStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '6',
});

const cardContentStyle = css({
  paddingBlockStart: '3',
  color: 'fg.muted',
});

/**
 * Two-slot layout: start and end content sit at opposite edges. The whole
 * bar is one tab stop — arrow keys move between the controls inside it.
 */
export const Default: Story = {
  args: {
    startContent: (
      <>
        <Button icon={Scissors} isIconOnly label="Cut" variant="ghost" />
        <Button icon={Copy} isIconOnly label="Copy" variant="ghost" />
        <Button label="Paste" variant="ghost" />
      </>
    ),
    endContent: (
      <Button icon={Settings} isIconOnly label="Settings" variant="ghost" />
    ),
  },
};

/**
 * Three-slot layout: with `centerContent` the toolbar switches to a CSS grid
 * (`1fr auto 1fr`), so the center stays centered regardless of how wide the
 * start and end slots are.
 */
export const ThreeSlot: Story = {
  args: {
    label: 'Document toolbar',
    startContent: (
      <Button icon={ArrowLeft} isIconOnly label="Back" variant="ghost" />
    ),
    centerContent: <Text type="label">Q1 Planning Document</Text>,
    endContent: (
      <>
        <Button label="Discard" variant="secondary" />
        <Button label="Save" variant="primary" />
      </>
    ),
  },
};

/**
 * The toolbar's `size` cascades to sizeable children — Buttons, Tabs, inputs
 * — so one prop keeps every control in the bar matching.
 */
export const Sizes: Story = {
  render: function Render() {
    const [tab, setTab] = useState('overview');
    return (
      <div className={columnStyle}>
        {(['sm', 'md', 'lg'] as const).map(size => (
          <Toolbar
            dividers={['bottom']}
            endContent={
              <>
                <Button
                  icon={Download}
                  isIconOnly
                  label="Export"
                  variant="ghost"
                />
                <Button label="New item" variant="primary" />
              </>
            }
            key={size}
            label={`Tab navigation (${size})`}
            size={size}
            startContent={
              <Tabs label="Sections" onChange={setTab} value={tab}>
                <Tab label="Overview" value="overview" />
                <Tab label="Analytics" value="analytics" />
                <Tab label="Settings" value="settings" />
              </Tabs>
            }
          />
        ))}
      </div>
    );
  },
};

/**
 * Toolbar as a card header: title on the start side, actions on the end, and
 * a bottom divider separating it from the card body.
 */
export const CardHeader: Story = {
  render: () => (
    <Card style={{width: 480}}>
      <Toolbar
        dividers={['bottom']}
        endContent={
          <>
            <Button icon={Filter} isIconOnly label="Filter" variant="ghost" />
            <Button icon={Plus} isIconOnly label="Add user" variant="primary" />
          </>
        }
        label="User list actions"
        size="sm"
        startContent={<Text type="label">Users</Text>}
      />
      <div className={cardContentStyle}>
        <Text type="body">Table rows go here…</Text>
      </div>
    </Card>
  ),
};

/**
 * Filter bar above a table: a search input and filter selects on the start
 * side, view controls on the end. Arrow-key navigation skips nothing, but
 * arrow keys inside the text input keep moving the caret.
 */
export const TableFilters: Story = {
  render: function Render() {
    const [status, setStatus] = useState<string | null>(null);
    return (
      <Toolbar
        endContent={
          <SegmentedControl label="View" onChange={() => {}} value="list">
            <SegmentedControlItem label="List" value="list" />
            <SegmentedControlItem label="Grid" value="grid" />
          </SegmentedControl>
        }
        label="Table filters"
        size="sm"
        startContent={
          <>
            <TextInput
              isLabelHidden
              label="Search"
              onChange={() => {}}
              placeholder="Search…"
              value=""
            />
            <Select
              isLabelHidden
              label="Status"
              onChange={setStatus}
              options={['Open', 'In progress', 'Done']}
              placeholder="Status"
              value={status}
            />
            <Button label="Assignee" variant="secondary" />
          </>
        }
      />
    );
  },
};

/**
 * Bulk-selection toolbar: a count badge with contextual actions. Only the
 * start slot is used, so it fills the bar.
 */
export const BulkActions: Story = {
  args: {
    label: 'Bulk actions',
    size: 'sm',
    dividers: ['top', 'bottom'],
    startContent: (
      <>
        <Badge label="5 selected" />
        <Button icon={Trash2} isIconOnly label="Delete" variant="ghost" />
        <Button icon={Archive} isIconOnly label="Archive" variant="ghost" />
      </>
    ),
    endContent: <Button label="Deselect all" variant="ghost" />,
  },
};

/**
 * Stacked toolbars: primary actions above, filters below, separated by
 * dividers. Each bar is its own tab stop.
 */
export const Stacked: Story = {
  render: () => (
    <Card style={{width: 640}}>
      <Toolbar
        dividers={['bottom']}
        endContent={
          <>
            <Button
              icon={RefreshCw}
              isIconOnly
              label="Refresh"
              variant="ghost"
            />
            <Button icon={Download} isIconOnly label="Export" variant="ghost" />
            <Button label="New order" variant="primary" />
          </>
        }
        label="Primary actions"
        size="sm"
        startContent={<Text type="label">Orders</Text>}
      />
      <Toolbar
        dividers={['bottom']}
        endContent={<Button label="Clear filters" variant="ghost" />}
        label="Filters"
        size="sm"
        startContent={
          <>
            <TextInput
              isLabelHidden
              label="Search orders"
              onChange={() => {}}
              placeholder="Search orders…"
              value=""
            />
            <Button label="Status" variant="secondary" />
            <Button label="Date range" variant="secondary" />
          </>
        }
      />
      <div className={cardContentStyle}>
        <Text type="body">Order table rows…</Text>
      </div>
    </Card>
  ),
};

/**
 * Vertical orientation: the toolbar stacks its slots and the up/down arrow
 * keys move focus instead of left/right.
 */
export const Vertical: Story = {
  render: () => (
    <div style={{height: 320, display: 'inline-flex'}}>
      <Toolbar
        dividers={['end']}
        endContent={
          <Button icon={Settings} isIconOnly label="Settings" variant="ghost" />
        }
        label="Canvas tools"
        orientation="vertical"
        startContent={
          <>
            <Button icon={Scissors} isIconOnly label="Cut" variant="ghost" />
            <Button icon={Copy} isIconOnly label="Copy" variant="ghost" />
            <Button icon={Trash2} isIconOnly label="Delete" variant="ghost" />
          </>
        }
      />
    </div>
  ),
};
