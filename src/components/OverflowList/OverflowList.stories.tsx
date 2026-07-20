import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge} from 'components/Badge';
import {
  OverflowList,
  type OverflowListProps,
} from 'components/OverflowList/OverflowList';

const labels = ['Design', 'Engineering', 'Research', 'Operations', 'Support'];

const meta = {
  title: 'Components/OverflowList',
  component: OverflowList,
  args: {
    behavior: 'observeSelf',
    collapseFrom: 'end',
    gap: 2,
    minVisibleItems: 0,
  },
  argTypes: {
    behavior: {control: 'select', options: ['observeSelf', 'observeParent']},
    collapseFrom: {control: 'select', options: ['end', 'start']},
    gap: {
      control: 'select',
      options: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows the items that fit in one row and collapses the rest into a custom indicator. ' +
          'For accurate measurement, every child is rendered in a hidden inert row and the visible slice is rendered again. ' +
          'That extra mount/render work is a real cost, so reduce or virtualize collections containing hundreds of expensive items.',
      },
    },
  },
} satisfies Meta<OverflowListProps>;

export default meta;
type Story = StoryObj<OverflowListProps>;

function Example(args: OverflowListProps): React.JSX.Element {
  return (
    <OverflowList
      {...args}
      overflowRenderer={items => (
        <Badge color="info" label={`+${items.length}`} />
      )}
      style={{maxWidth: 360}}>
      {labels.map(label => (
        <Badge key={label} label={label} />
      ))}
    </OverflowList>
  );
}

export const Default: Story = {
  args: {children: null},
  render: args => <Example {...args} />,
};

export const CollapseFromStart: Story = {
  args: {children: null, collapseFrom: 'start'},
  render: args => <Example {...args} />,
};

export const KeepTwoVisible: Story = {
  args: {children: null, minVisibleItems: 2},
  render: args => <Example {...args} />,
};
