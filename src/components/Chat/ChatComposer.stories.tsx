import type {Meta, StoryObj} from '@storybook/react-vite';
import {Mic, Paperclip, SlidersHorizontal} from 'lucide-react';
import {useState} from 'react';
import {Button} from 'components/Button';
import {ChatComposer} from 'components/Chat/ChatComposer';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const meta: Meta<typeof ChatComposer> = {
  title: 'Components/Chat/Composer',
  component: ChatComposer,
  args: {
    onSubmit: () => {},
    placeholder: 'Type a message…',
  },
  argTypes: {
    density: {
      control: {type: 'select'},
      options: ['compact', 'balanced', 'spacious'],
    },
    statusPosition: {
      control: {type: 'select'},
      options: ['top', 'bottom'],
    },
    isDisabled: {control: 'boolean'},
    isStopShown: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const containerStyle = css({
  maxW: '640px',
  p: '4',
  bg: 'bg.subtle',
  borderRadius: 'xl',
});

export const Basic: Story = {
  render: args => (
    <div className={containerStyle}>
      <ChatComposer {...args} />
    </div>
  ),
};

export const WithSlots: Story = {
  render: args => (
    <div className={containerStyle}>
      <ChatComposer
        {...args}
        footerActions={
          <Button
            icon={SlidersHorizontal}
            isIconOnly
            label="Options"
            variant="ghost"
          />
        }
        headerActions={
          <Button
            icon={Paperclip}
            isIconOnly
            label="Attach"
            size="sm"
            variant="ghost"
          />
        }
        headerContext={<Text size="sm">32k tokens left</Text>}
        sendActions={
          <Button icon={Mic} isIconOnly label="Dictate" variant="ghost" />
        }
      />
    </div>
  ),
};

function StopModeDemo() {
  const [isStopShown, setIsStopShown] = useState(true);
  return (
    <div className={containerStyle}>
      <ChatComposer
        isStopShown={isStopShown}
        onStop={() => setIsStopShown(false)}
        onSubmit={() => setIsStopShown(true)}
        placeholder="Submit to stream, stop to cancel…"
      />
    </div>
  );
}

export const StopMode: Story = {
  render: () => <StopModeDemo />,
};

export const ErrorStatus: Story = {
  render: args => (
    <div className={containerStyle}>
      <ChatComposer
        {...args}
        status={{message: 'Message failed to send. Retry?', type: 'error'}}
      />
    </div>
  ),
};

export const WarningStatusTop: Story = {
  render: args => (
    <div className={containerStyle}>
      <ChatComposer
        {...args}
        status={{
          message: 'The context window is almost full.',
          type: 'warning',
        }}
        statusPosition="top"
      />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  const [sent, setSent] = useState<string[]>([]);
  return (
    <div className={containerStyle}>
      <ChatComposer
        onChange={setValue}
        onSubmit={next => setSent(current => [...current, next])}
        value={value}
      />
      <Text size="sm">
        Draft: {value === '' ? '(empty)' : value} — sent:{' '}
        {sent.length === 0 ? '(none)' : sent.join(', ')}
      </Text>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
  },
  render: args => (
    <div className={containerStyle}>
      <ChatComposer {...args} />
    </div>
  ),
};
