import type {Meta, StoryObj} from '@storybook/react-vite';
import {Spinner} from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg', 'xl'],
    },
    shade: {
      control: {type: 'select'},
      options: ['default', 'subtle', 'onMedia'],
    },
    label: {control: 'text'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: {
    label: 'Loading...',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  ),
};

export const OnMedia: Story = {
  render: () => (
    <div style={{display: 'inline-flex', padding: '1rem', background: '#111'}}>
      <Spinner shade="onMedia" />
    </div>
  ),
};
