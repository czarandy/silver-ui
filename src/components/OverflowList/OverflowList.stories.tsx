import type {Meta, StoryObj} from '@storybook/react-vite';
import {Badge} from 'components/Badge';
import {
  OverflowList,
  type OverflowItem,
} from 'components/OverflowList/OverflowList';

const labels = ['Design', 'Engineering', 'Research', 'Operations', 'Support'];

function overflowBadge(items: OverflowItem[]): React.JSX.Element {
  return <Badge color="info" label={`+${items.length}`} />;
}

const meta: Meta<typeof OverflowList> = {
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <OverflowList
      {...args}
      overflowRenderer={overflowBadge}
      style={{maxWidth: 360}}>
      {labels.map(label => (
        <Badge key={label} label={label} />
      ))}
    </OverflowList>
  ),
};

export const CollapseFromStart: Story = {
  args: {collapseFrom: 'start'},
  render: args => (
    <OverflowList
      {...args}
      overflowRenderer={overflowBadge}
      style={{maxWidth: 360}}>
      {labels.map(label => (
        <Badge key={label} label={label} />
      ))}
    </OverflowList>
  ),
};

export const KeepTwoVisible: Story = {
  args: {minVisibleItems: 2},
  render: args => (
    <OverflowList
      {...args}
      overflowRenderer={overflowBadge}
      style={{maxWidth: 360}}>
      {labels.map(label => (
        <Badge key={label} label={label} />
      ))}
    </OverflowList>
  ),
};

export const ObserveParent: Story = {
  args: {behavior: 'observeParent'},
  parameters: {
    docs: {
      description: {
        story:
          'With `behavior="observeParent"` the fit calculation tracks the parent’s content width, ' +
          'so the list can share a flex row with other content and take the space that remains.',
      },
    },
  },
  render: args => (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 12,
        maxWidth: 420,
      }}>
      <span style={{whiteSpace: 'nowrap'}}>Teams:</span>
      <OverflowList {...args} overflowRenderer={overflowBadge}>
        {labels.map(label => (
          <Badge key={label} label={label} />
        ))}
      </OverflowList>
    </div>
  ),
};
