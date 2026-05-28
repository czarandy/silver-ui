import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Text} from '../Text';
import {Popover} from './Popover';

const meta: Meta<typeof Popover> = {
  title: 'Components/Popover',
  component: Popover,
  argTypes: {
    alignment: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    placement: {
      control: {type: 'select'},
      options: ['above', 'below', 'start', 'end'],
    },
    isEnabled: {control: 'boolean'},
    label: {control: 'text'},
    width: {control: 'text'},
  },
  args: {
    label: 'Settings',
    placement: 'below',
    alignment: 'start',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <Popover
      {...args}
      content={
        <div style={{display: 'grid', gap: '0.5rem'}}>
          <Text as="p">Notification settings</Text>
          <Button label="Save" size="sm" variant="primary" />
        </div>
      }>
      <Button label="Open popover" />
    </Popover>
  ),
};

export const MatchTriggerWidth: Story = {
  render: args => (
    <Popover
      {...args}
      content={<Text as="p">This popover uses the trigger width.</Text>}>
      <Button label="Wide trigger button" />
    </Popover>
  ),
};

export const CustomWidth: Story = {
  args: {width: 280},
  render: args => (
    <Popover
      {...args}
      content={<Text as="p">A fixed-width popover for richer panels.</Text>}>
      <Button label="Open fixed panel" />
    </Popover>
  ),
};
