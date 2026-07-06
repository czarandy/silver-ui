import type {Meta, StoryObj} from '@storybook/react-vite';
import {Spinner} from 'components/Spinner/Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Components/Spinner',
  component: Spinner,
  argTypes: {
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg', 28, 32, 36],
    },
    variant: {
      control: {type: 'select'},
      options: ['default', 'onMedia'],
    },
    label: {control: 'text'},
    description: {control: 'text'},
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

export const WithDescription: Story = {
  args: {
    label: 'Uploading files',
    description: 'This may take a few moments',
  },
};

export const LargeWithDescription: Story = {
  args: {
    size: 36,
    label: 'Uploading files',
    description: 'This may take a few moments',
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size={28} />
      <Spinner size={32} />
      <Spinner size={36} />
    </div>
  ),
};

export const SizesWithLabels: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: '1rem'}}>
      <Spinner label="Small" size="sm" />
      <Spinner label="Medium" size="md" />
      <Spinner label="Large" size="lg" />
      <Spinner label="28px" size={28} />
      <Spinner label="32px" size={32} />
      <Spinner label="36px" size={36} />
    </div>
  ),
};

export const OnMedia: Story = {
  render: () => (
    <div style={{display: 'inline-flex', padding: '1rem', background: '#111'}}>
      <Spinner variant="onMedia" />
    </div>
  ),
};

export const OnMediaWithLabel: Story = {
  render: () => (
    <div style={{display: 'inline-flex', padding: '1rem', background: '#111'}}>
      <Spinner label="Loading media" variant="onMedia" />
    </div>
  ),
};

export const OnMediaWithDescription: Story = {
  render: () => (
    <div style={{display: 'inline-flex', padding: '1rem', background: '#111'}}>
      <Spinner
        description="Streaming from the server"
        label="Loading media"
        variant="onMedia"
      />
    </div>
  ),
};
