import type {Meta, StoryObj} from '@storybook/react-vite';
import {BriefcaseBusiness, Filter, User} from 'lucide-react';
import {useState} from 'react';
import {Button} from 'components/Button';
import {
  Select,
  type SelectOptionData,
  type SelectProps,
} from 'components/Select/Select';
import {SelectOption} from 'components/Select/SelectOption';
import {VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {Toolbar} from 'components/Toolbar';

const peopleOptions = [
  {label: 'Ada Lovelace', value: 'ada'},
  {label: 'Grace Hopper', value: 'grace'},
  {label: 'Katherine Johnson', value: 'katherine'},
];

type PersonAuxiliaryData = {email: string; role: string};

const peopleOptionsWithAuxiliaryData: SelectOptionData<PersonAuxiliaryData>[] =
  [
    {
      auxiliaryData: {
        email: 'ada@example.com',
        role: 'Mathematician',
      },
      label: 'Ada Lovelace',
      value: 'ada',
    },
    {
      auxiliaryData: {email: 'grace@example.com', role: 'Engineer'},
      label: 'Grace Hopper',
      value: 'grace',
    },
    {
      auxiliaryData: {
        email: 'katherine@example.com',
        role: 'Mathematician',
      },
      label: 'Katherine Johnson',
      value: 'katherine',
    },
  ];

const disabledOptions: SelectProps['options'] = [
  {label: 'Ada Lovelace', value: 'ada'},
  {isDisabled: true, label: 'Grace Hopper (unavailable)', value: 'grace'},
  {label: 'Katherine Johnson', value: 'katherine'},
  {isDisabled: true, label: 'Hedy Lamarr (unavailable)', value: 'hedy'},
];

const manyOptions: SelectProps['options'] = Array.from(
  {length: 40},
  (_, index) => ({
    label: `Option ${index + 1}`,
    value: `option-${index + 1}`,
  }),
);

const sectionedOptions: SelectProps['options'] = [
  {
    title: 'Engineering',
    type: 'section',
    options: [
      {label: 'Ada Lovelace', value: 'ada'},
      {label: 'Grace Hopper', value: 'grace'},
    ],
  },
  {type: 'divider'},
  {
    title: 'Science',
    type: 'section',
    options: [
      {label: 'Katherine Johnson', value: 'katherine'},
      {label: 'Hedy Lamarr', value: 'hedy'},
    ],
  },
];

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    htmlName: 'assignee',
    label: 'Assignee',
    options: peopleOptions,
    placeholder: 'Select a person',
  },
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: ['outline', 'ghost', 'button'],
    },
  },
} satisfies Meta<SelectProps>;

export default meta;
type Story = StoryObj<SelectProps>;

function SelectStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return <Select {...args} hasClear onChange={setValue} value={value} />;
}

function EmptySelectStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>(null);
  return <Select {...args} hasClear onChange={setValue} value={value} />;
}

function SizesStory(args: React.ComponentProps<typeof Select>) {
  const [small, setSmall] = useState<string | null>('ada');
  const [medium, setMedium] = useState<string | null>('grace');
  const [large, setLarge] = useState<string | null>('katherine');
  return (
    <div style={{display: 'grid', gap: 16}}>
      <Select
        {...args}
        label="Small"
        onChange={setSmall}
        size="sm"
        value={small}
      />
      <Select {...args} label="Medium" onChange={setMedium} value={medium} />
      <Select
        {...args}
        label="Large"
        onChange={setLarge}
        size="lg"
        value={large}
      />
    </div>
  );
}

function CustomOptionsStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return (
    <Select
      {...args}
      hasSearch
      onChange={setValue}
      renderOption={option => (
        <SelectOption
          description={`${option.value}@example.com`}
          icon={User}
          label={option.label ?? option.value}
        />
      )}
      value={value}
    />
  );
}

function AuxiliaryDataStory() {
  const [value, setValue] = useState<string | null>('ada');
  const [selectedData, setSelectedData] = useState<PersonAuxiliaryData | null>(
    peopleOptionsWithAuxiliaryData[0]?.auxiliaryData ?? null,
  );

  return (
    <VStack align="start" gap={2}>
      <Select<PersonAuxiliaryData>
        hasClear
        label="Assignee"
        onChange={(nextValue, option) => {
          setValue(nextValue);
          setSelectedData(option?.auxiliaryData ?? null);
        }}
        options={peopleOptionsWithAuxiliaryData}
        renderOption={option => (
          <SelectOption
            description={option.auxiliaryData?.role}
            label={option.label ?? option.value}
          />
        )}
        value={value}
      />
      <Text color="secondary" type="supporting">
        {selectedData == null
          ? 'No payload selected'
          : `Selected payload: ${selectedData.email} (${selectedData.role})`}
      </Text>
    </VStack>
  );
}

function OptionLabelTooltipsStory(args: React.ComponentProps<typeof Select>) {
  const [value, setValue] = useState<string | null>('ada');
  return (
    <Select
      {...args}
      onChange={setValue}
      renderOption={option => (
        <SelectOption
          label={option.label ?? option.value}
          labelTooltip={`More information about ${option.label ?? option.value}`}
        />
      )}
      value={value}
    />
  );
}

function TriggerVariantsStory(args: React.ComponentProps<typeof Select>) {
  const [ghostValue, setGhostValue] = useState<string | null>('ada');
  const [buttonValue, setButtonValue] = useState<string | null>('grace');

  return (
    <VStack gap={2} width="full">
      <Toolbar
        dividers={['bottom']}
        label="Ghost trigger example"
        size="sm"
        startContent={
          <>
            <Button icon={Filter} label="Filter" variant="ghost" />
            <Select
              {...args}
              isLabelHidden
              label="Assignee filter"
              onChange={setGhostValue}
              value={ghostValue}
              variant="ghost"
            />
          </>
        }
      />
      <Toolbar
        dividers={['bottom']}
        label="Button trigger example"
        size="sm"
        startContent={
          <>
            <Button icon={Filter} label="Filter" variant="secondary" />
            <Select
              {...args}
              isLabelHidden
              label="Assignee filter"
              onChange={setButtonValue}
              value={buttonValue}
              variant="button"
            />
          </>
        }
      />
    </VStack>
  );
}

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When the Select is focused and closed, type the beginning of an option label to select it without opening the menu.',
      },
    },
  },
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Searchable: Story = {
  args: {hasSearch: true},
  parameters: {
    docs: {
      description: {
        story:
          'The dropdown search uses the standard TextInput styling, with a leading search icon and a clear action after typing.',
      },
    },
  },
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const EntriesOnFocus: Story = {
  args: {hasEntriesOnFocus: true},
  parameters: {
    docs: {
      description: {
        story:
          'With `hasEntriesOnFocus`, tabbing to the trigger opens the option list right away, matching AutocompleteInput. Clicking the trigger still toggles it.',
      },
    },
  },
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};

export const TriggerVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Ghost triggers share the same hover and focus treatment as ghost Buttons. Button triggers use the standard secondary Button surface. Both inherit their small size from Toolbar.',
      },
    },
  },
  render: (args: SelectProps) => <TriggerVariantsStory {...args} />,
};

export const CustomOptions: Story = {
  render: (args: SelectProps) => <CustomOptionsStory {...args} />,
};

export const AuxiliaryData: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Option values remain stable strings while typed auxiliary data is available to custom rendering and the selection callback.',
      },
    },
  },
  render: () => <AuxiliaryDataStory />,
};

export const OptionLabelTooltips: Story = {
  render: (args: SelectProps) => <OptionLabelTooltipsStory {...args} />,
};

export const Disabled: Story = {
  args: {isDisabled: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Loading: Story = {
  args: {isLoading: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const ManyOptions: Story = {
  args: {options: manyOptions},
  parameters: {
    docs: {
      description: {
        story:
          'With a long, overflowing option list, arrowing with the keyboard keeps the highlighted option scrolled into view.',
      },
    },
  },
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};

export const SectionsAndDividers: Story = {
  args: {options: sectionedOptions},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const ValidationStatus: Story = {
  args: {
    status: {message: 'Choose an assignee before continuing.', type: 'error'},
  },
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const Sizes: Story = {
  render: (args: SelectProps) => <SizesStory {...args} />,
};

export const WithStartIcon: Story = {
  args: {startIcon: BriefcaseBusiness},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const HiddenLabel: Story = {
  args: {isLabelHidden: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};

export const CustomPlaceholder: Story = {
  args: {placeholder: 'Assign someone'},
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};

export const DisabledOptions: Story = {
  args: {options: disabledOptions},
  render: (args: SelectProps) => <EmptySelectStory {...args} />,
};

export const ReadOnly: Story = {
  args: {isReadOnly: true},
  render: (args: SelectProps) => <SelectStory {...args} />,
};
