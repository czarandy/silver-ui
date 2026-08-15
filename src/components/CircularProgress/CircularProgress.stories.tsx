import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  CircularProgress,
  type CircularProgressProps,
} from 'components/CircularProgress/CircularProgress';

const meta = {
  title: 'Components/CircularProgress',
  component: CircularProgress,
  args: {
    hasValueLabel: true,
    label: 'Upload progress',
    value: 60,
  },
} satisfies Meta<CircularProgressProps>;

export default meta;
type Story = StoryObj<CircularProgressProps>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
      <CircularProgress hasValueLabel label="Info" value={60} variant="info" />
      <CircularProgress
        hasValueLabel
        label="Success"
        value={80}
        variant="success"
      />
      <CircularProgress
        hasValueLabel
        label="Warning"
        value={45}
        variant="warning"
      />
      <CircularProgress
        hasValueLabel
        label="Error"
        value={30}
        variant="error"
      />
      <CircularProgress
        hasValueLabel
        label="Neutral"
        value={50}
        variant="neutral"
      />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
      <CircularProgress label="Compact" size={32} value={60} />
      <CircularProgress hasValueLabel label="Default" value={60} />
      <CircularProgress hasValueLabel label="Large" size="6rem" value={60} />
    </div>
  ),
};

export const CustomFormatter: Story = {
  args: {
    formatValueLabel: (value, max) => `${value} / ${max}`,
    max: 5,
    size: 96,
    value: 3,
  },
};

export const Indeterminate: Story = {
  args: {isIndeterminate: true, value: undefined},
};

export const Disabled: Story = {
  args: {isDisabled: true},
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
};
