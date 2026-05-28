import type {Meta, StoryObj} from '@storybook/react-vite';
import {FileText} from 'lucide-react';
import {useState} from 'react';
import {Icon} from '../Icon';
import {Text} from '../Text';
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

function NonLinearStory(args: React.ComponentProps<typeof Stepper>) {
  const [activeStep, setActiveStep] = useState(args.activeStep);
  return (
    <Stepper {...args} activeStep={activeStep} onStepClick={setActiveStep}>
      <Step label="Account" step={0} />
      <Step label="Profile" step={1} />
      <Step label="Review" step={2} />
    </Stepper>
  );
}

export const NonLinear: Story = {
  render: args => <NonLinearStory {...args} />,
};

export const States: Story = {
  render: args => (
    <Stepper {...args} activeStep={1}>
      <Step isCompleted label="Completed" step={0} />
      <Step hasError label="Error" step={1} />
      <Step isDisabled label="Disabled" step={2} />
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
