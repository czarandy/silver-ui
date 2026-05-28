import type {Meta, StoryObj} from '@storybook/react-vite';
import {css} from 'styled-system/css';
import {Card} from '../Card';
import {Stack} from '../Stack';
import {Text} from '../Text';
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

const containerStyle = css({bg: 'bg.subtle', borderRadius: 'md'});

export const Basic: Story = {
  render: args => (
    <Center {...args} className={containerStyle}>
      <Text type="body">Centered content</Text>
    </Center>
  ),
};

export const Horizontal: Story = {
  args: {
    axis: 'horizontal',
  },
  render: args => (
    <Center {...args} className={containerStyle}>
      <Text type="body">Centered horizontally</Text>
    </Center>
  ),
};

export const Vertical: Story = {
  args: {
    axis: 'vertical',
  },
  render: args => (
    <Center {...args} className={containerStyle}>
      <Text type="body">Centered vertically</Text>
    </Center>
  ),
};

export const Inline: Story = {
  render: () => (
    <Text as="p" type="body">
      Before{' '}
      <Center axis="both" height={48} isInline width={160}>
        <Text type="supporting">Inline centered</Text>
      </Center>{' '}
      After
    </Text>
  ),
};

export const ExplicitSize: Story = {
  render: () => (
    <Stack direction="horizontal" gap={4}>
      <Center className={containerStyle} height={120} width={200}>
        <Text type="body">200 × 120</Text>
      </Center>
      <Center className={containerStyle} height="8rem" width="50%">
        <Text type="body">50% × 8rem</Text>
      </Center>
    </Stack>
  ),
};

export const InsideStack: Story = {
  render: () => (
    <Stack gap={4} height={300}>
      <Card>
        <Text type="body">Above</Text>
      </Card>
      <Center className={containerStyle} style={{flex: 1}}>
        <Text type="body">Fills remaining space</Text>
      </Center>
      <Card>
        <Text type="body">Below</Text>
      </Card>
    </Stack>
  ),
};

export const FillsParent: Story = {
  render: () => (
    <div className={containerStyle} style={{height: 200}}>
      <Center height="100%" width="100%">
        <Text type="body">Fills parent dimensions</Text>
      </Center>
    </div>
  ),
};
