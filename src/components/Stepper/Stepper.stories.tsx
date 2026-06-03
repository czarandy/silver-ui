/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileText} from 'lucide-react';
import {useState} from 'react';
import {Button} from '../Button';
import {Icon} from '../Icon';
import {HStack, VStack} from '../Stack';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {Step} from './Step';
import {Stepper} from './Stepper';

const meta: Meta<typeof Stepper> = {
  title: 'Components/Stepper',
  component: Stepper,
  argTypes: {
    activeStep: {control: {type: 'number', min: 0, max: 2}},
    orientation: {
      control: {type: 'select'},
      options: ['horizontal', 'vertical'],
    },
  },
  args: {
    activeStep: 1,
    orientation: 'horizontal',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <Stepper {...args}>
      <Step description="Create account" label="Account" step={0} />
      <Step description="Add details" label="Profile" step={1} />
      <Step description="Confirm setup" label="Review" step={2} />
    </Stepper>
  ),
};

export const Vertical: Story = {
  args: {orientation: 'vertical'},
  render: args => (
    <Stepper {...args}>
      <Step description="Create account" label="Account" step={0}>
        <Text as="p">Account details are complete.</Text>
      </Step>
      <Step description="Add details" label="Profile" step={1}>
        <Text as="p">Profile details are being edited.</Text>
      </Step>
      <Step description="Confirm setup" label="Review" step={2} />
    </Stepper>
  ),
};

export const NonLinear: Story = {
  render: args => {
    const [activeStep, setActiveStep] = useState(args.activeStep);
    return (
      <Stepper {...args} activeStep={activeStep} onStepClick={setActiveStep}>
        <Step label="Account" step={0} />
        <Step label="Profile" step={1} />
        <Step label="Review" step={2} />
      </Stepper>
    );
  },
};

export const NonLinearVertical: Story = {
  args: {orientation: 'vertical'},
  render: args => {
    const [activeStep, setActiveStep] = useState(args.activeStep);
    return (
      <Stepper {...args} activeStep={activeStep} onStepClick={setActiveStep}>
        <Step description="Create account" label="Account" step={0}>
          <Text as="p">Account content here.</Text>
        </Step>
        <Step description="Add details" label="Profile" step={1}>
          <Text as="p">Profile content here.</Text>
        </Step>
        <Step description="Confirm setup" label="Review" step={2}>
          <Text as="p">Review content here.</Text>
        </Step>
      </Stepper>
    );
  },
};

export const States: Story = {
  render: args => (
    <Stepper {...args} activeStep={1}>
      <Step
        description="This step is done"
        isCompleted
        label="Completed"
        step={0}
      />
      <Step
        description="Something went wrong"
        hasError
        label="Error"
        step={1}
      />
      <Step
        description="Cannot proceed yet"
        isDisabled
        label="Disabled"
        step={2}
      />
    </Stepper>
  ),
};

export const CompletedOverride: Story = {
  render: args => (
    <Stepper {...args} activeStep={0}>
      <Step description="Currently active" label="Step 1" step={0} />
      <Step description="Skipped ahead" label="Step 2" step={1} />
      <Step
        description="Marked complete manually"
        isCompleted
        label="Step 3"
        step={2}
      />
    </Stepper>
  ),
};

export const AllCompleted: Story = {
  render: args => (
    <Stepper {...args} activeStep={3}>
      <Step description="Done" label="Account" step={0} />
      <Step description="Done" label="Profile" step={1} />
      <Step description="Done" label="Review" step={2} />
    </Stepper>
  ),
};

export const CustomIcon: Story = {
  render: args => (
    <Stepper {...args} activeStep={0}>
      <Step
        icon={<Icon color="inherit" icon={FileText} size="sm" />}
        label="Draft"
        step={0}
      />
      <Step label="Review" step={1} />
      <Step label="Publish" step={2} />
    </Stepper>
  ),
};

export const VerticalWithForm: Story = {
  args: {orientation: 'vertical'},
  render: args => {
    const [activeStep, setActiveStep] = useState(0);
    return (
      <Stepper {...args} activeStep={activeStep}>
        <Step description="Enter your email" label="Account" step={0}>
          <VStack gap={3} style={{maxWidth: 320, paddingBlock: 8}}>
            <TextInput label="Email" onChange={() => {}} value="" />
            <HStack gap={2}>
              <Button
                label="Next"
                onClick={() => setActiveStep(1)}
                size="sm"
                variant="primary"
              />
            </HStack>
          </VStack>
        </Step>
        <Step description="Add your name" label="Profile" step={1}>
          <VStack gap={3} style={{maxWidth: 320, paddingBlock: 8}}>
            <TextInput label="Name" onChange={() => {}} value="" />
            <HStack gap={2}>
              <Button
                label="Back"
                onClick={() => setActiveStep(0)}
                size="sm"
                variant="ghost"
              />
              <Button
                label="Next"
                onClick={() => setActiveStep(2)}
                size="sm"
                variant="primary"
              />
            </HStack>
          </VStack>
        </Step>
        <Step description="Confirm details" label="Review" step={2}>
          <VStack gap={3} style={{paddingBlock: 8}}>
            <Text as="p">Everything looks good!</Text>
            <HStack gap={2}>
              <Button
                label="Back"
                onClick={() => setActiveStep(1)}
                size="sm"
                variant="ghost"
              />
              <Button label="Submit" size="sm" variant="primary" />
            </HStack>
          </VStack>
        </Step>
      </Stepper>
    );
  },
};

export const ManySteps: Story = {
  render: args => (
    <Stepper {...args} activeStep={3}>
      <Step label="Requirements gathering" step={0} />
      <Step label="Design specifications" step={1} />
      <Step label="Implementation details" step={2} />
      <Step label="Quality assurance testing" step={3} />
      <Step label="Staging deployment" step={4} />
      <Step label="Production release" step={5} />
    </Stepper>
  ),
};
