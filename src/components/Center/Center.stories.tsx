import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from '../Card';
import {Center} from './Center';

const meta: Meta<typeof Center> = {
  title: 'Components/Center',
  component: Center,
  args: {
    axis: 'both',
    height: 240,
    width: '100%',
  },
  argTypes: {
    axis: {
      control: {type: 'select'},
      options: ['both', 'horizontal', 'vertical'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <Center {...args} style={{background: '#eef2f5'}}>
      <Card>Centered content</Card>
    </Center>
  ),
};
