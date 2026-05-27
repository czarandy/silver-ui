import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Tooltip} from './Tooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    placement: {
      control: {type: 'select'},
      options: ['above', 'below', 'start', 'end'],
    },
    alignment: {
      control: {type: 'select'},
      options: ['start', 'center', 'end'],
    },
    delay: {control: 'number'},
    hideDelay: {control: 'number'},
    focusTrigger: {
      control: {type: 'select'},
      options: ['auto', 'always', 'never'],
    },
    isEnabled: {control: 'boolean'},
    isOpen: {control: 'boolean'},
    isDefaultOpen: {control: 'boolean'},
    hasHoverIndication: {
      control: {type: 'select'},
      options: ['auto', true, false],
    },
    content: {control: 'text'},
    children: {control: 'text'},
  },
  args: {
    children: 'Hover for details',
    content: 'Helpful tooltip text',
    placement: 'above',
    alignment: 'center',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};

export const ButtonTrigger: Story = {
  render: args => (
    <Tooltip {...args}>
      <Button label="Hover me" />
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', padding: '4rem'}}>
      <Tooltip content="Above" placement="above">
        <Button label="Above" />
      </Tooltip>
      <Tooltip content="Below" placement="below">
        <Button label="Below" />
      </Tooltip>
      <Tooltip content="Start" placement="start">
        <Button label="Start" />
      </Tooltip>
      <Tooltip content="End" placement="end">
        <Button label="End" />
      </Tooltip>
    </div>
  ),
};
