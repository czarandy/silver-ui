/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {NumberInput} from '../NumberInput';
import {TextInput} from '../TextInput';
import {InputGroup, type InputGroupProps} from './InputGroup';
import {InputGroupText} from './InputGroupText';

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  args: {label: 'Website', size: 'md'},
} satisfies Meta<InputGroupProps>;

export default meta;
type Story = StoryObj<InputGroupProps>;

export const Default: Story = {
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          placeholder="example"
          value={value}
        />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>
    );
  },
};

export const Currency: Story = {
  args: {label: 'Price'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState<number | null>(24);
    return (
      <InputGroup {...args}>
        <InputGroupText>$</InputGroupText>
        <NumberInput
          hasClear
          isLabelHidden
          label="Amount"
          min={0}
          onChange={setValue}
          value={value}
        />
        <InputGroupText>USD</InputGroupText>
      </InputGroup>
    );
  },
};

export const WithStatus: Story = {
  args: {
    description: 'Enter a complete website host name.',
    label: 'Website',
    status: {message: 'Website is required', type: 'error'},
  },
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          value={value}
        />
      </InputGroup>
    );
  },
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: InputGroupProps) => (
    <InputGroup {...args}>
      <InputGroupText>https://</InputGroupText>
      <TextInput
        isLabelHidden
        label="URL"
        onChange={() => {}}
        value="example"
      />
      <InputGroupText>.com</InputGroupText>
    </InputGroup>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <InputGroup key={size} label={`Size ${size}`} size={size}>
          <InputGroupText>https://</InputGroupText>
          <TextInput
            isLabelHidden
            label="URL"
            onChange={() => {}}
            placeholder="example"
            value=""
          />
          <InputGroupText>.com</InputGroupText>
        </InputGroup>
      ))}
    </div>
  ),
};

export const Required: Story = {
  args: {isRequired: true},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          placeholder="example"
          value={value}
        />
      </InputGroup>
    );
  },
};

export const Optional: Story = {
  args: {isOptional: true},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          placeholder="example"
          value={value}
        />
      </InputGroup>
    );
  },
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          placeholder="example"
          value={value}
        />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>
    );
  },
};

export const WithLabelTooltip: Story = {
  args: {labelTooltip: 'The full URL where your site is hosted.'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>https://</InputGroupText>
        <TextInput
          isLabelHidden
          label="URL"
          onChange={setValue}
          placeholder="example"
          value={value}
        />
      </InputGroup>
    );
  },
};

export const MultipleInputs: Story = {
  args: {label: 'Date range'},
  render: (args: InputGroupProps) => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    return (
      <InputGroup {...args}>
        <TextInput
          isLabelHidden
          label="Start date"
          onChange={setStart}
          placeholder="Start"
          value={start}
        />
        <InputGroupText>to</InputGroupText>
        <TextInput
          isLabelHidden
          label="End date"
          onChange={setEnd}
          placeholder="End"
          value={end}
        />
      </InputGroup>
    );
  },
};
