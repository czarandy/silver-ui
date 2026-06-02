import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  Bell,
  Check,
  ChevronRight,
  Circle,
  GripVertical,
  User,
} from 'lucide-react';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {Item} from './Item';

const meta: Meta<typeof Item> = {
  title: 'Components/Item',
  component: Item,
  args: {
    description: 'Supporting text',
    label: 'Item label',
  },
  argTypes: {
    align: {control: {type: 'select'}, options: ['center', 'start']},
    isDisabled: {control: 'boolean'},
    isHighlighted: {control: 'boolean'},
    isSelected: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSlots: Story = {
  render: args => (
    <Item
      {...args}
      endContent={<Badge label="Admin" />}
      startContent={<Icon color="secondary" icon={User} size="sm" />}
    />
  ),
};

export const EndContentInline: Story = {
  args: {
    label: 'Beta features',
    endContent: <Badge color="blue" label="New" />,
    endContentPosition: 'inline',
  },
};

export const Interactive: Story = {
  args: {
    onClick: () => {},
    endContent: <Icon icon={ChevronRight} size="sm" />,
  },
};

export const DisabledStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Item isDisabled label="Static disabled" />
      <Item isDisabled label="Button disabled" onClick={() => {}} />
      <Item href="/disabled" isDisabled label="Link disabled" />
    </div>
  ),
};

export const Selected: Story = {
  args: {
    isSelected: true,
    label: 'Selected item',
    startContent: <Icon color="primary" icon={Check} size="sm" />,
  },
};

export const Highlighted: Story = {
  args: {
    isHighlighted: true,
    label: 'Highlighted item',
  },
};

export const LinkItem: Story = {
  args: {
    endContent: <Icon icon={ChevronRight} size="sm" />,
    href: '/settings',
    label: 'Account settings',
  },
};

export const AlignStart: Story = {
  args: {
    align: 'start',
    description:
      'A longer description wraps across multiple lines so the icon remains aligned to the start of the text block.',
    label: 'Multi-line item with start alignment',
    startContent: <Badge label="NEW" />,
  },
};

export const Truncation: Story = {
  args: {
    description:
      'This description is intentionally long enough to wrap across several lines, but the story limits it to two lines so consumers can see the truncation behavior.',
    descriptionLines: 2,
    label:
      'This is a very long item label that is intentionally constrained to one line',
    labelLines: 1,
    style: {maxWidth: 360},
  },
};

export const Polymorphic: Story = {
  render: () => (
    <ul style={{listStyle: 'none', margin: 0, padding: 0}}>
      <Item
        as="li"
        description="Rendered as an li for list composition."
        label="List item"
      />
      <Item
        as="li"
        description="Another list row using the same primitive."
        label="Second list item"
      />
    </ul>
  ),
};

export const StartAdornment: Story = {
  args: {
    label: 'Item with external marker',
    leadingContent: <Icon color="secondary" icon={Circle} size="sm" />,
    startContent: <Icon color="secondary" icon={GripVertical} size="sm" />,
  },
};

export const CombinedStates: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
      <Item isDisabled isSelected label="Disabled and selected" />
      <Item isHighlighted isSelected label="Highlighted and selected" />
      <Item
        isHighlighted
        label="Highlighted interactive"
        onClick={() => {}}
        startContent={<Icon color="secondary" icon={Bell} size="sm" />}
      />
    </div>
  ),
};

export const OptionRole: Story = {
  render: () => (
    <div aria-label="People" role="listbox">
      <Item
        aria-current={undefined}
        isSelected
        label="Ada Lovelace"
        onClick={() => {}}
        role="option"
        startContent={<Icon color="secondary" icon={User} size="sm" />}
      />
      <Item
        label="Grace Hopper"
        onClick={() => {}}
        role="option"
        startContent={<Icon color="secondary" icon={User} size="sm" />}
      />
    </div>
  ),
};
