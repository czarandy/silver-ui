/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileText} from 'lucide-react';
import {useState} from 'react';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {HStack, VStack} from '../Stack';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {Stepper, type StepConfig} from './Stepper';

const baseSteps: StepConfig[] = [
  {id: 'account', label: 'Account', description: 'Create account'},
  {id: 'profile', label: 'Profile', description: 'Add details'},
  {id: 'review', label: 'Review', description: 'Confirm setup'},
];

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  argTypes: {
    activeStep: {
      control: {type: 'select'},
      options: ['account', 'profile', 'review'],
    },
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    activeStep: 'profile',
    orientation: 'horizontal',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {steps: baseSteps},
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    steps: [
      {
        id: 'account',
        label: 'Account',
        description: 'Create account',
        content: <Text as="p">Account details are complete.</Text>,
      },
      {
        id: 'profile',
        label: 'Profile',
        description: 'Add details',
        content: <Text as="p">Profile details are being edited.</Text>,
      },
      {id: 'review', label: 'Review', description: 'Confirm setup'},
    ],
  },
};

export const NonLinear: Story = {
  render: args => {
    const [activeStep, setActiveStep] = useState(args.activeStep);
    return (
      <Stepper
        {...args}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        steps={baseSteps}
      />
    );
  },
};

export const NonLinearVertical: Story = {
  args: {orientation: 'vertical'},
  render: args => {
    const [activeStep, setActiveStep] = useState(args.activeStep);
    return (
      <Stepper
        {...args}
        activeStep={activeStep}
        onStepClick={setActiveStep}
        steps={[
          {
            id: 'account',
            label: 'Account',
            description: 'Create account',
            content: <Text as="p">Account content here.</Text>,
          },
          {
            id: 'profile',
            label: 'Profile',
            description: 'Add details',
            content: <Text as="p">Profile content here.</Text>,
          },
          {
            id: 'review',
            label: 'Review',
            description: 'Confirm setup',
            content: <Text as="p">Review content here.</Text>,
          },
        ]}
      />
    );
  },
};

export const States: Story = {
  args: {
    activeStep: 'error',
    steps: [
      {
        id: 'completed',
        label: 'Completed',
        description: 'This step is done',
        isCompleted: true,
      },
      {
        id: 'error',
        label: 'Error',
        description: 'Something went wrong',
        hasError: true,
      },
      {
        id: 'disabled',
        label: 'Disabled',
        description: 'Cannot proceed yet',
        isDisabled: true,
      },
    ],
  },
};

export const CompletedOverride: Story = {
  args: {
    activeStep: 'one',
    steps: [
      {id: 'one', label: 'Step 1', description: 'Currently active'},
      {id: 'two', label: 'Step 2', description: 'Skipped ahead'},
      {
        id: 'three',
        label: 'Step 3',
        description: 'Marked complete manually',
        isCompleted: true,
      },
    ],
  },
};

export const AllCompleted: Story = {
  args: {
    activeStep: 'done',
    steps: [
      {id: 'account', label: 'Account', description: 'Done', isCompleted: true},
      {id: 'profile', label: 'Profile', description: 'Done', isCompleted: true},
      {id: 'review', label: 'Review', description: 'Done', isCompleted: true},
    ],
  },
};

export const CustomIcon: Story = {
  args: {
    activeStep: 'draft',
    steps: [
      {
        id: 'draft',
        label: 'Draft',
        icon: <Icon color="inherit" icon={FileText} size="sm" />,
      },
      {id: 'review', label: 'Review'},
      {id: 'publish', label: 'Publish'},
    ],
  },
};

export const VerticalWithForm: Story = {
  args: {orientation: 'vertical'},
  render: args => {
    const [activeStep, setActiveStep] = useState('account');
    return (
      <Stepper
        {...args}
        activeStep={activeStep}
        steps={[
          {
            id: 'account',
            label: 'Account',
            description: 'Enter your email',
            content: (
              <VStack gap={3} style={{maxWidth: 320, paddingBlock: 8}}>
                <TextInput label="Email" onChange={() => {}} value="" />
                <HStack gap={2}>
                  <Button
                    label="Next"
                    onClick={() => setActiveStep('profile')}
                    size="sm"
                    variant="primary"
                  />
                </HStack>
              </VStack>
            ),
          },
          {
            id: 'profile',
            label: 'Profile',
            description: 'Add your name',
            content: (
              <VStack gap={3} style={{maxWidth: 320, paddingBlock: 8}}>
                <TextInput label="Name" onChange={() => {}} value="" />
                <HStack gap={2}>
                  <Button
                    label="Back"
                    onClick={() => setActiveStep('account')}
                    size="sm"
                    variant="ghost"
                  />
                  <Button
                    label="Next"
                    onClick={() => setActiveStep('review')}
                    size="sm"
                    variant="primary"
                  />
                </HStack>
              </VStack>
            ),
          },
          {
            id: 'review',
            label: 'Review',
            description: 'Confirm details',
            content: (
              <VStack gap={3} style={{paddingBlock: 8}}>
                <Text as="p">Everything looks good!</Text>
                <HStack gap={2}>
                  <Button
                    label="Back"
                    onClick={() => setActiveStep('profile')}
                    size="sm"
                    variant="ghost"
                  />
                  <Button label="Submit" size="sm" variant="primary" />
                </HStack>
              </VStack>
            ),
          },
        ]}
      />
    );
  },
};

export const ManySteps: Story = {
  args: {
    activeStep: 'qa',
    steps: [
      {id: 'requirements', label: 'Requirements gathering'},
      {id: 'design', label: 'Design specifications'},
      {id: 'implementation', label: 'Implementation details'},
      {id: 'qa', label: 'Quality assurance testing'},
      {id: 'staging', label: 'Staging deployment'},
      {id: 'production', label: 'Production release'},
    ],
  },
};
