import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileArchive, FileText, Image} from 'lucide-react';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {CheckboxCard} from 'components/Card/CheckboxCard';
import {CheckboxGroup} from 'components/CheckboxGroup';
import {Icon} from 'components/Icon';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const groupClassName = css({maxW: 'md'});

function ImportSelection(): React.JSX.Element {
  const [value, setValue] = useState(['documents']);
  const items = [
    {
      description: '24 PDF and text files',
      icon: FileText,
      label: 'Documents',
      value: 'documents',
    },
    {
      description: '128 photos and illustrations',
      icon: Image,
      label: 'Images',
      value: 'images',
    },
    {
      description: '6 compressed archives',
      icon: FileArchive,
      label: 'Archives',
      value: 'archives',
    },
  ];

  return (
    <CheckboxGroup
      className={groupClassName}
      label="Content to import"
      onChange={setValue}
      value={value}>
      {items.map(item => (
        <CheckboxCard
          key={item.value}
          label={item.label}
          padding={4}
          value={item.value}>
          <HStack align="center" gap={3} justify="between">
            <HStack align="center" gap={2}>
              <Icon color="secondary" icon={item.icon} />
              <VStack gap={0}>
                <Text type="label">{item.label}</Text>
                <Text color="secondary" type="supporting">
                  {item.description}
                </Text>
              </VStack>
            </HStack>
            {item.value === 'documents' ? (
              <Badge color="blue" label="Recommended" />
            ) : null}
          </HStack>
        </CheckboxCard>
      ))}
    </CheckboxGroup>
  );
}

const meta = {
  title: 'Components/Card/CheckboxCard',
  component: CheckboxCard,
  args: {
    children: <Text type="label">Documents</Text>,
    label: 'Documents',
    value: 'documents',
  },
} satisfies Meta<typeof CheckboxCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ImportItems: Story = {
  render: () => <ImportSelection />,
};

export const States: Story = {
  render: () => (
    <CheckboxGroup
      className={groupClassName}
      label="Selection states"
      onChange={() => {}}
      value={['selected']}>
      <CheckboxCard label="Selected option" padding={4} value="selected">
        <Text type="label">Selected option</Text>
      </CheckboxCard>
      <CheckboxCard
        isDisabled
        label="Disabled option"
        padding={4}
        value="disabled">
        <Text type="label">Disabled option</Text>
      </CheckboxCard>
    </CheckboxGroup>
  ),
};
