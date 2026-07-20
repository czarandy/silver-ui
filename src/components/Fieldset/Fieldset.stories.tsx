import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Fieldset, type FieldsetProps} from 'components/Fieldset/Fieldset';
import {InputGroup} from 'components/InputGroup/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {VStack} from 'components/Stack';
import {TextInput} from 'components/TextInput';

function ProfileFields(): React.JSX.Element {
  const [name, setName] = useState('Ada Lovelace');
  const [email, setEmail] = useState('ada@example.com');
  const [organization, setOrganization] = useState('Analytical Engines');

  return (
    <>
      <TextInput label="Full name" onChange={setName} value={name} />
      <TextInput
        label="Email address"
        onChange={setEmail}
        type="email"
        value={email}
      />
      <TextInput
        label="Organization"
        onChange={setOrganization}
        value={organization}
      />
    </>
  );
}

function ConnectedWebsiteInput(): React.JSX.Element {
  const [website, setWebsite] = useState('example');

  return (
    <InputGroup label="Website">
      <InputGroupText>https://</InputGroupText>
      <TextInput
        isLabelHidden
        label="URL"
        onChange={setWebsite}
        value={website}
      />
      <InputGroupText>.com</InputGroupText>
    </InputGroup>
  );
}

const meta = {
  title: 'Components/Fieldset',
  component: Fieldset,
  args: {
    children: null,
    legend: 'Profile details',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Use `Fieldset` for separate fields that share a conceptual section, need a native legend, or need native disabled cascading. Use `InputGroup` when controls and addons make up one visually connected input row. Use `Field` for one labeled control.',
      },
    },
  },
} satisfies Meta<FieldsetProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <Fieldset {...args}>
      <ProfileFields />
    </Fieldset>
  ),
};

export const WithDescription: Story = {
  args: {
    description: 'This information appears on your public profile.',
  },
  render: args => (
    <Fieldset {...args}>
      <ProfileFields />
    </Fieldset>
  ),
};

export const RequiredAndOptional: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Necessity text describes the group. Each child control remains responsible for its own native `required` attribute.',
      },
    },
  },
  render: () => (
    <VStack gap={8}>
      <Fieldset isRequired legend="Billing details">
        <ProfileFields />
      </Fieldset>
      <Fieldset isOptional legend="Secondary contact">
        <ProfileFields />
      </Fieldset>
    </VStack>
  ),
};

export const ErrorSummary: Story = {
  args: {
    status: {
      message: 'Enter an email address before saving this section.',
      type: 'error',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'The summary describes the fieldset but does not propagate error state to its child fields.',
      },
    },
  },
  render: args => (
    <Fieldset {...args}>
      <ProfileFields />
    </Fieldset>
  ),
};

export const Disabled: Story = {
  args: {isDisabled: true},
  parameters: {
    docs: {
      description: {
        story:
          'The child inputs do not receive `isDisabled`; the native fieldset attribute disables them.',
      },
    },
  },
  render: args => (
    <Fieldset {...args}>
      <ProfileFields />
    </Fieldset>
  ),
};

export const CustomGap: Story = {
  args: {gap: 8},
  render: args => (
    <Fieldset {...args}>
      <ProfileFields />
    </Fieldset>
  ),
};

export const FieldsetVersusInputGroup: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`Fieldset` stacks independently labeled controls under a native legend. `InputGroup` combines controls and addons into one connected field.',
      },
    },
  },
  render: () => (
    <VStack gap={8}>
      <Fieldset legend="Profile details">
        <ProfileFields />
      </Fieldset>
      <ConnectedWebsiteInput />
    </VStack>
  ),
};
