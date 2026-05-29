import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Heart,
  Italic,
  Star,
  Underline,
} from 'lucide-react';
import {useState} from 'react';
import {ToggleButton} from './ToggleButton';
import {ToggleButtonGroup} from './ToggleButtonGroup';

const meta = {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  argTypes: {
    isSelected: {control: 'boolean'},
    isDisabled: {control: 'boolean'},
    isLoading: {control: 'boolean'},
    isIconOnly: {control: 'boolean'},
    size: {
      control: {type: 'select'},
      options: ['sm', 'md', 'lg'],
    },
  },
  args: {
    label: 'Toggle',
  },
} satisfies Meta<typeof ToggleButton>;

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Default: Story = {
  render: function Default() {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <ToggleButton
        isSelected={isSelected}
        label="Toggle"
        onChange={setIsSelected}
      />
    );
  },
};

export const WithIcon: Story = {
  render: function WithIcon() {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <ToggleButton
        icon={Star}
        isSelected={isSelected}
        label="Favorite"
        onChange={setIsSelected}
        selectedIcon={Heart}
      />
    );
  },
};

export const IconOnly: Story = {
  render: function IconOnly() {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <ToggleButton
        icon={Star}
        isIconOnly
        isSelected={isSelected}
        label="Favorite"
        onChange={setIsSelected}
      />
    );
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
      <ToggleButton icon={Star} label="Small" size="sm" />
      <ToggleButton icon={Star} label="Medium" size="md" />
      <ToggleButton icon={Star} label="Large" size="lg" />
    </div>
  ),
};

export const Loading: Story = {
  args: {
    isLoading: true,
    label: 'Syncing',
  },
};

export const WithTooltip: Story = {
  render: function WithTooltip() {
    const [isSelected, setIsSelected] = useState(false);
    return (
      <ToggleButton
        icon={Star}
        isIconOnly
        isSelected={isSelected}
        label="Favorite"
        onChange={setIsSelected}
        tooltip="Add to favorites"
      />
    );
  },
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    label: 'Disabled',
  },
};

export const SingleGroup: Story = {
  render: function SingleGroup() {
    const [value, setValue] = useState<string | null>('left');
    return (
      <ToggleButtonGroup
        label="Alignment"
        onChange={setValue}
        type="single"
        value={value}>
        <ToggleButton
          icon={AlignLeft}
          isIconOnly
          label="Align left"
          value="left"
        />
        <ToggleButton
          icon={AlignCenter}
          isIconOnly
          label="Align center"
          value="center"
        />
        <ToggleButton
          icon={AlignRight}
          isIconOnly
          label="Align right"
          value="right"
        />
      </ToggleButtonGroup>
    );
  },
};

export const MultipleGroup: Story = {
  render: function MultipleGroup() {
    const [value, setValue] = useState<string[]>(['bold']);
    return (
      <ToggleButtonGroup
        label="Formatting"
        onChange={setValue}
        type="multiple"
        value={value}>
        <ToggleButton icon={Bold} isIconOnly label="Bold" value="bold" />
        <ToggleButton icon={Italic} isIconOnly label="Italic" value="italic" />
        <ToggleButton
          icon={Underline}
          isIconOnly
          label="Underline"
          value="underline"
        />
      </ToggleButtonGroup>
    );
  },
};

export const VerticalGroup: Story = {
  render: function VerticalGroup() {
    const [value, setValue] = useState<string | null>('left');
    return (
      <ToggleButtonGroup
        label="Alignment"
        onChange={setValue}
        orientation="vertical"
        type="single"
        value={value}>
        <ToggleButton
          icon={AlignLeft}
          isIconOnly
          label="Align left"
          value="left"
        />
        <ToggleButton
          icon={AlignCenter}
          isIconOnly
          label="Align center"
          value="center"
        />
        <ToggleButton
          icon={AlignRight}
          isIconOnly
          label="Align right"
          value="right"
        />
      </ToggleButtonGroup>
    );
  },
};

export const DisabledGroup: Story = {
  render: function DisabledGroup() {
    const [value, setValue] = useState<string | null>('bold');
    return (
      <ToggleButtonGroup
        isDisabled
        label="Formatting"
        onChange={setValue}
        type="single"
        value={value}>
        <ToggleButton icon={Bold} isIconOnly label="Bold" value="bold" />
        <ToggleButton icon={Italic} isIconOnly label="Italic" value="italic" />
        <ToggleButton
          icon={Underline}
          isIconOnly
          label="Underline"
          value="underline"
        />
      </ToggleButtonGroup>
    );
  },
};
