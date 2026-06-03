import type {Meta, StoryObj} from '@storybook/react-vite';
import {useCallback} from 'react';
import {Badge} from '../Badge';
import {Button} from '../Button';
import {Text} from '../Text';
import {Tooltip} from './Tooltip';
import {useTooltip} from './useTooltip';

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

export const TextTrigger: Story = {};

export const ButtonTrigger: Story = {
  render: (args): React.JSX.Element => (
    <Tooltip {...args}>
      <Button label="Hover me" />
    </Tooltip>
  ),
};

export const Placements: Story = {
  render: (): React.JSX.Element => (
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

export const Alignments: Story = {
  render: (): React.JSX.Element => (
    <div style={{display: 'flex', gap: '2rem', padding: '4rem'}}>
      <Tooltip alignment="start" content="Aligned to start" placement="above">
        <Button label="Start" />
      </Tooltip>
      <Tooltip alignment="center" content="Aligned to center" placement="above">
        <Button label="Center" />
      </Tooltip>
      <Tooltip alignment="end" content="Aligned to end" placement="above">
        <Button label="End" />
      </Tooltip>
    </div>
  ),
};

export const Disabled: Story = {
  args: {isEnabled: false},
};

export const RichContent: Story = {
  render: (args): React.JSX.Element => (
    <Tooltip
      {...args}
      content={
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <Text type="label">Keyboard shortcut</Text>
          <Text color="secondary" type="supporting">
            Press Cmd+K to open the command palette
          </Text>
        </div>
      }>
      <Button label="Help" />
    </Tooltip>
  ),
};

function UseTooltipHookStory(): React.JSX.Element {
  const handleShow = useCallback(() => {}, []);
  const handleHide = useCallback(() => {}, []);
  const tooltip = useTooltip({
    placement: 'above',
    onShow: handleShow,
    onHide: handleHide,
  });

  return (
    <>
      <Badge
        aria-describedby={tooltip.describedBy}
        color="info"
        label="Hover this badge"
        ref={tooltip.ref}
      />
      {tooltip.renderTooltip('Attached via useTooltip hook')}
    </>
  );
}

export const WithUseTooltipHook: Story = {
  render: (): React.JSX.Element => <UseTooltipHookStory />,
};

export const HoverIndication: Story = {
  args: {
    children: 'Underlined on hover',
    hasHoverIndication: true,
  },
};
