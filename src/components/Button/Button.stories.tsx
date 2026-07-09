import type {Meta, StoryObj} from '@storybook/react-vite';
import {Inbox, Plus, RefreshCw, Settings} from 'lucide-react';
import {useState} from 'react';
import {Button} from 'components/Button/Button';
import {Icon} from 'components/Icon';
import {SegmentedControl} from 'components/SegmentedControl/SegmentedControl';
import {SegmentedControlItem} from 'components/SegmentedControl/SegmentedControlItem';
import {TextInput} from 'components/TextInput';
import {css} from 'styled-system/css';

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: ['primary', 'secondary', 'ghost', 'destructive', 'onSolid'],
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
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof Button>;

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

/**
 * Button, the input family and SegmentedControl all size themselves from the
 * shared `component.*` scale, so they stay the same height at any given size.
 * Scoping that token to a single component would break this alignment.
 */
export const SizeAlignment: Story = {
  render: function SizeAlignmentStory() {
    const [value, setValue] = useState('day');
    const [name, setName] = useState('');

    return (
      <div style={{display: 'grid', gap: '1.5rem'}}>
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div
            key={size}
            style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
            <Button label={size} size={size} variant="primary" />
            <TextInput
              isLabelHidden
              label={`Name (${size})`}
              onChange={setName}
              placeholder="Name"
              size={size}
              value={name}
            />
            <SegmentedControl
              label={`View (${size})`}
              onChange={setValue}
              size={size}
              value={value}>
              <SegmentedControlItem label="Day" value="day" />
              <SegmentedControlItem label="Week" value="week" />
            </SegmentedControl>
          </div>
        ))}
      </div>
    );
  },
};

export const WithContent: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button icon={Plus} label="Add" />
      <Button
        endContent={<Icon icon={Inbox} />}
        label="Inbox"
        variant="secondary"
      />
      <Button icon={Settings} isIconOnly label="Settings" />
    </div>
  ),
};

export const IconSizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button icon={Plus} label="Small" size="sm" />
      <Button icon={Plus} label="Medium" size="md" />
      <Button icon={Plus} label="Large" size="lg" />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    label: 'Disabled',
    tooltip: 'This action is currently unavailable.',
  },
};

export const Loading: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button isLoading label="Small" size="sm" variant="primary" />
      <Button isLoading label="Medium" size="md" variant="primary" />
      <Button isLoading label="Large" size="lg" variant="primary" />
    </div>
  ),
};

export const LoadingWithEndContent: Story = {
  render: () => (
    <Button
      endContent={<Icon icon={Inbox} />}
      isLoading
      label="Sync inbox"
      variant="primary"
    />
  ),
};

export const LinkButton: Story = {
  args: {
    href: '/docs',
    label: 'Open docs',
    variant: 'primary',
  },
};

export const WithTooltip: Story = {
  args: {
    label: 'Hover me',
    tooltip: 'Helpful context for this action.',
  },
};

export const DisabledWithTooltip: Story = {
  args: {
    isDisabled: true,
    label: 'Unavailable',
    tooltip: 'This action is not available for your current role.',
  },
};

export const WithStartContent: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button
        label="Status"
        startContent={
          <span
            className={css({
              w: '2',
              h: '2',
              borderRadius: 'full',
              bg: 'green',
            })}
          />
        }
      />
      <Button
        label="Inbox"
        startContent={<Icon icon={Inbox} />}
        variant="primary"
      />
      <Button
        endContent={<Icon icon={Settings} />}
        label="Configure"
        startContent={
          <span
            className={css({
              w: '2',
              h: '2',
              borderRadius: 'full',
              bg: 'orange',
            })}
          />
        }
        variant="secondary"
      />
    </div>
  ),
};

export const OnSolid: Story = {
  render: () => (
    <div
      className={css({bg: 'primary', borderRadius: 'lg', p: '4'})}
      style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center',
        color: 'white',
      }}>
      <Button icon={Settings} isIconOnly label="Settings" variant="onSolid" />
      <Button label="Action" variant="onSolid" />
      <Button icon={Plus} label="Add item" variant="onSolid" />
    </div>
  ),
};

export const IconOnlyLoading: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <Button icon={RefreshCw} isIconOnly isLoading label="Refresh" size="sm" />
      <Button
        icon={RefreshCw}
        isIconOnly
        isLoading
        label="Refresh"
        size="md"
        variant="primary"
      />
      <Button
        icon={RefreshCw}
        isIconOnly
        isLoading
        label="Refresh"
        size="lg"
        variant="ghost"
      />
    </div>
  ),
};
