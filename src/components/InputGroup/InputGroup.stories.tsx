import type {Meta, StoryObj} from '@storybook/react-vite';
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
  render: (args: InputGroupProps) => (
    <InputGroup {...args}>
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
  ),
};

export const Currency: Story = {
  args: {label: 'Price'},
  render: (args: InputGroupProps) => (
    <InputGroup {...args}>
      <InputGroupText>$</InputGroupText>
      <NumberInput
        hasClear
        isLabelHidden
        label="Amount"
        min={0}
        onChange={() => {}}
        value={24}
      />
      <InputGroupText>USD</InputGroupText>
    </InputGroup>
  ),
};

export const WithStatus: Story = {
  args: {
    description: 'Enter a complete website host name.',
    label: 'Website',
    status: {message: 'Website is required', type: 'error'},
  },
  render: (args: InputGroupProps) => (
    <InputGroup {...args}>
      <InputGroupText>https://</InputGroupText>
      <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
    </InputGroup>
  ),
};
