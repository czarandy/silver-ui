import type {Meta, StoryObj} from '@storybook/react-vite';
import {Progress, type ProgressProps} from 'components/Progress/Progress';

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: {label: 'Upload progress', value: 60},
} satisfies Meta<ProgressProps>;

export default meta;
type Story = StoryObj<ProgressProps>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Progress label="Info" value={60} variant="info" />
      <Progress label="Success" value={80} variant="success" />
      <Progress label="Warning" value={45} variant="warning" />
      <Progress label="Error" value={30} variant="error" />
      <Progress label="Neutral" value={50} variant="neutral" />
    </div>
  ),
};

export const WithValueLabel: Story = {
  args: {hasValueLabel: true},
};

export const CustomFormatter: Story = {
  args: {
    formatValueLabel: (value, max) => `${value} GB / ${max} GB`,
    hasValueLabel: true,
    max: 5,
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

export const CustomMax: Story = {
  args: {hasValueLabel: true, max: 5, value: 3},
};

export const Complete: Story = {
  args: {hasValueLabel: true, value: 100, variant: 'success'},
};
