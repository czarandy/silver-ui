import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'default',
    padding: 4,
  },
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: [
        'default',
        'transparent',
        'muted',
        'blue',
        'cyan',
        'gray',
        'green',
        'orange',
        'pink',
        'purple',
        'red',
        'teal',
        'yellow',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <Card {...args} width={360}>
      Card content
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)'}}>
      {(['default', 'muted', 'blue', 'green', 'red', 'yellow'] as const).map(
        variant => (
          <Card key={variant} variant={variant}>
            {variant}
          </Card>
        ),
      )}
    </div>
  ),
};
