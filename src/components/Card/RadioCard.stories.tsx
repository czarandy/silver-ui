import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {RadioCard} from 'components/Card/RadioCard';
import {RadioGroup} from 'components/RadioGroup';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const groupClassName = css({maxW: 'lg'});

function PlanSelection({isReadOnly = false}: {isReadOnly?: boolean}) {
  const [value, setValue] = useState('pro');
  const plans = [
    {description: 'For personal projects', label: 'Free', value: 'free'},
    {description: 'For growing teams', label: 'Pro', value: 'pro'},
    {
      description: 'For organizations at scale',
      label: 'Enterprise',
      value: 'enterprise',
    },
  ];

  return (
    <RadioGroup
      className={groupClassName}
      isReadOnly={isReadOnly}
      label="Plan"
      onChange={setValue}
      value={value}>
      {plans.map(plan => (
        <RadioCard
          key={plan.value}
          label={plan.label}
          padding={4}
          value={plan.value}>
          <HStack align="center" gap={3} justify="between">
            <VStack gap={0}>
              <Text type="label">{plan.label}</Text>
              <Text color="secondary" type="supporting">
                {plan.description}
              </Text>
            </VStack>
            {plan.value === 'pro' ? (
              <Badge color="blue" label="Popular" />
            ) : null}
          </HStack>
        </RadioCard>
      ))}
    </RadioGroup>
  );
}

const meta = {
  title: 'Components/Card/RadioCard',
  component: RadioCard,
  args: {
    children: <Text type="label">Pro plan</Text>,
    label: 'Pro',
    value: 'pro',
  },
} satisfies Meta<typeof RadioCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Plans: Story = {
  render: () => <PlanSelection />,
};

export const ReadOnly: Story = {
  render: () => <PlanSelection isReadOnly />,
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup
      className={groupClassName}
      label="Plan"
      onChange={() => {}}
      value="free">
      <RadioCard label="Free" padding={4} value="free">
        <Text type="label">Free plan</Text>
      </RadioCard>
      <RadioCard isDisabled label="Pro" padding={4} value="pro">
        <Text type="label">Pro plan</Text>
      </RadioCard>
    </RadioGroup>
  ),
};
