import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronRight, Settings} from 'lucide-react';
import {Button} from 'components/Button';
import {ClickableCard} from 'components/Card/ClickableCard';
import {Icon} from 'components/Icon';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const cardClassName = css({w: 'sm'});

const meta = {
  title: 'Components/Card/ClickableCard',
  component: ClickableCard,
  args: {
    children: (
      <HStack align="center" gap={3} justify="between">
        <HStack align="center" gap={2}>
          <Icon icon={Settings} />
          <VStack gap={0}>
            <Text type="label">Account settings</Text>
            <Text color="secondary" type="supporting">
              Manage your profile and preferences
            </Text>
          </VStack>
        </HStack>
        <Icon color="secondary" icon={ChevronRight} />
      </HStack>
    ),
    className: cardClassName,
    label: 'Open account settings',
    onClick: () => {},
    padding: 4,
  },
  argTypes: {
    isDisabled: {control: 'boolean'},
    isReadOnly: {control: 'boolean'},
  },
} satisfies Meta<typeof ClickableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Action: Story = {};

export const Link: Story = {
  args: {
    href: '/settings/account',
    onClick: undefined,
  },
};

export const NestedControl: Story = {
  render: args => (
    <ClickableCard {...args}>
      <VStack gap={3}>
        <VStack gap={0}>
          <Text type="label">Quarterly report</Text>
          <Text color="secondary" type="supporting">
            Open the report without capturing its independent actions.
          </Text>
        </VStack>
        <HStack gap={2}>
          <Button label="Archive report" onClick={() => {}} size="sm" />
        </HStack>
      </VStack>
    </ClickableCard>
  ),
};

export const Disabled: Story = {
  args: {
    disabledReason: 'Account settings are unavailable',
    isDisabled: true,
  },
};

export const ReadOnly: Story = {
  args: {isReadOnly: true},
};
