/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {
  AutocompleteInput,
  createStaticSearchSource,
  type SearchableItem,
} from 'components/AutocompleteInput';
import {
  InputGroup,
  type InputGroupProps,
} from 'components/InputGroup/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {MultiSelect} from 'components/MultiSelect';
import {NumberInput} from 'components/NumberInput';
import {Select} from 'components/Select';
import {TagsInput} from 'components/TagsInput';
import {TextInput} from 'components/TextInput';

const PEOPLE: SearchableItem[] = [
  {id: 'ada', label: 'Ada Lovelace'},
  {id: 'grace', label: 'Grace Hopper'},
  {id: 'katherine', label: 'Katherine Johnson'},
];

const meta = {
  title: 'Components/InputGroup',
  component: InputGroup,
  args: {label: 'Website', size: 'md'},
  parameters: {
    docs: {
      description: {
        component:
          'Use `InputGroup` when controls and addons make up one visually connected input row. Use `Fieldset` for separate fields that share a conceptual section, need a native legend, or need native disabled cascading. Use `Field` for one labeled control.',
      },
    },
  },
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

export const PhoneNumber: Story = {
  args: {label: 'Phone number'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState('');
    return (
      <InputGroup {...args}>
        <InputGroupText>+1</InputGroupText>
        <TextInput
          autoComplete="tel"
          isLabelHidden
          label="Phone number"
          onChange={setValue}
          placeholder="(555) 123-4567"
          type="tel"
          value={value}
        />
      </InputGroup>
    );
  },
};

export const WithSelect: Story = {
  args: {label: 'Price'},
  render: (args: InputGroupProps) => {
    const [amount, setAmount] = useState<number | null>(24);
    const [currency, setCurrency] = useState<string | null>('USD');
    return (
      <InputGroup {...args}>
        <NumberInput
          isLabelHidden
          label="Amount"
          min={0}
          onChange={setAmount}
          value={amount}
        />
        <Select
          isLabelHidden
          label="Currency"
          onChange={setCurrency}
          options={['USD', 'EUR', 'GBP']}
          value={currency}
        />
      </InputGroup>
    );
  },
};

export const WithMultiSelect: Story = {
  args: {label: 'Columns'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState<string[]>(['Name']);
    return (
      <InputGroup {...args}>
        <InputGroupText>Show</InputGroupText>
        <MultiSelect
          isLabelHidden
          label="Columns"
          onChange={setValue}
          options={['Name', 'Email', 'Role']}
          value={value}
        />
      </InputGroup>
    );
  },
};

export const WithAutocompleteInput: Story = {
  args: {label: 'Assignee'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState<SearchableItem | null>(null);
    return (
      <InputGroup {...args}>
        <InputGroupText>@</InputGroupText>
        <AutocompleteInput
          isLabelHidden
          label="Person"
          onChange={setValue}
          placeholder="Search people"
          searchSource={createStaticSearchSource(PEOPLE)}
          value={value}
        />
      </InputGroup>
    );
  },
};

export const WithTagsInput: Story = {
  args: {label: 'Recipients'},
  render: (args: InputGroupProps) => {
    const [value, setValue] = useState<SearchableItem[]>([PEOPLE[0]]);
    return (
      <InputGroup {...args}>
        <InputGroupText>To</InputGroupText>
        <TagsInput
          isLabelHidden
          label="People"
          onChange={setValue}
          placeholder="Add people"
          searchSource={createStaticSearchSource(PEOPLE)}
          value={value}
        />
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

export const WithDetachedStatus: Story = {
  args: {
    label: 'Website',
    status: {message: 'Website is required', type: 'error'},
    statusVariant: 'detached',
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
