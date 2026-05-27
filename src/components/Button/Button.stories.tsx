import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
    isDisabled: {control: 'boolean'},
    isLoading: {control: 'boolean'},
    isIconOnly: {control: 'boolean'},
    label: {control: 'text'},
  },
  args: {
    label: 'Button',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {variant: 'primary'},
};

export const Secondary: Story = {
  args: {variant: 'secondary'},
};

export const Ghost: Story = {
  args: {variant: 'ghost'},
};

export const Destructive: Story = {
  args: {variant: 'destructive'},
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button label="Small" size="sm" />
      <Button label="Medium" size="md" />
      <Button label="Large" size="lg" />
    </div>
  ),
};

export const WithContent: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button label="Add" icon={<span aria-hidden="true">+</span>} />
      <Button
        label="Inbox"
        variant="secondary"
        endContent={<span aria-hidden="true">3</span>}
      />
      <Button
        label="Settings"
        icon={<span aria-hidden="true">S</span>}
        isIconOnly
      />
    </div>
  ),
};
