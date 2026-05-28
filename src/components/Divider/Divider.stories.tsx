import type {Meta, StoryObj} from '@storybook/react-vite';
import {Divider} from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'Components/Divider',
  component: Divider,
  args: {
    orientation: 'horizontal',
    variant: 'subtle',
  },
  argTypes: {
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
    variant: {
      control: {type: 'select'},
      options: ['subtle', 'strong'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => <Divider {...args} />,
};

export const WithLabel: Story = {
  args: {
    label: 'or',
  },
};
