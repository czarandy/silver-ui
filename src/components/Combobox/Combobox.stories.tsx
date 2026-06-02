import type {Meta, StoryObj} from '@storybook/react-vite';
import {User} from 'lucide-react';
import {useMemo, useState} from 'react';
import {Combobox, type ComboboxProps} from './Combobox';
import {ComboboxItem} from './ComboboxItem';
import {createStaticSource, type SearchableItem} from './types';

const people: SearchableItem<{role: string}>[] = [
  {id: 'ada', label: 'Ada Lovelace', auxiliaryData: {role: 'Mathematician'}},
  {id: 'grace', label: 'Grace Hopper', auxiliaryData: {role: 'Engineer'}},
  {
    id: 'katherine',
    label: 'Katherine Johnson',
    auxiliaryData: {role: 'Physicist'},
  },
];

const meta = {
  title: 'Components/Combobox',
  component: Combobox,
  args: {label: 'Assignee', placeholder: 'Search people'},
} satisfies Meta<ComboboxProps>;

export default meta;
type Story = StoryObj<ComboboxProps>;

function ComboboxStory(args: React.ComponentProps<typeof Combobox>) {
  const [value, setValue] = useState<SearchableItem | null>(null);
  const source = useMemo(() => createStaticSource(people), []);
  return (
    <Combobox
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={setValue}
      searchSource={source}
      value={value}
    />
  );
}

export const Default: Story = {
  render: (args: ComboboxProps) => <ComboboxStory {...args} />,
};

function CustomItemsStory(args: React.ComponentProps<typeof Combobox>) {
  const [value, setValue] = useState<SearchableItem<{role: string}> | null>(
    null,
  );
  const source = useMemo(() => createStaticSource(people), []);
  return (
    <Combobox
      {...args}
      debounceMs={0}
      hasEntriesOnFocus
      onChange={setValue}
      renderItem={item => (
        <ComboboxItem
          description={item.auxiliaryData?.role}
          icon={User}
          item={item}
        />
      )}
      searchSource={source}
      value={value}
    />
  );
}

export const CustomItems: Story = {
  render: (args: ComboboxProps) => <CustomItemsStory {...args} />,
};
