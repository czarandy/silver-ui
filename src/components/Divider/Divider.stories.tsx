import type {Meta, StoryObj} from '@storybook/react-vite';
import {css} from 'styled-system/css';
import {Card} from '../Card';
import {Text} from '../Text';
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
    isFullBleed: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => <Divider {...args} />,
};

export const WithLabel: Story = {
  args: {
    label: 'Section 2',
  },
};

export const Variants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
      <div>
        <Text color="secondary" size="sm">
          Subtle (default)
        </Text>
        <Divider />
      </div>
      <div>
        <Text color="secondary" size="sm">
          Strong
        </Text>
        <Divider variant="strong" />
      </div>
    </div>
  ),
};

const verticalContainerStyle = css({
  display: 'flex',
  alignItems: 'center',
  gap: '4',
  h: '80px',
});

export const Vertical: Story = {
  render: () => (
    <div className={verticalContainerStyle}>
      <Text>Left</Text>
      <Divider orientation="vertical" />
      <Text>Right</Text>
    </div>
  ),
};

export const VerticalWithLabel: Story = {
  render: () => (
    <div className={verticalContainerStyle} style={{height: '120px'}}>
      <Text>Left</Text>
      <Divider label="or" orientation="vertical" />
      <Text>Right</Text>
    </div>
  ),
};

export const FullBleed: Story = {
  render: () => (
    <Card>
      <Text>Content above the divider.</Text>
      <div style={{marginBlock: '1rem'}}>
        <Divider isFullBleed />
      </div>
      <Text>Content below the divider.</Text>
    </Card>
  ),
};

export const FullBleedVertical: Story = {
  render: () => (
    <Card style={{height: '120px'}}>
      <div className={verticalContainerStyle} style={{height: '100%'}}>
        <Text>Left</Text>
        <Divider isFullBleed orientation="vertical" />
        <Text>Right</Text>
      </div>
    </Card>
  ),
};
