import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Banner} from './Banner';

const meta: Meta<typeof Banner> = {
  title: 'Components/Banner',
  component: Banner,
  args: {
    status: 'info',
    title: 'New update available',
  },
  argTypes: {
    status: {
      control: {type: 'select'},
      options: ['info', 'warning', 'error', 'success'],
    },
    container: {
      control: {type: 'select'},
      options: ['card', 'section'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithDescription: Story = {
  args: {
    description: 'Review the changes before continuing.',
    status: 'warning',
    title: 'Configuration changed',
  },
};

export const WithActions: Story = {
  args: {
    endContent: <Button label="Review" size="sm" variant="ghost" />,
    isDismissable: true,
    status: 'error',
    title: 'Some items need attention',
  },
};

export const WithContent: Story = {
  args: {
    description: 'The following checks are still running.',
    isDefaultExpanded: true,
    status: 'info',
    title: 'Deployment in progress',
    children: (
      <ul>
        <li>Build completed</li>
        <li>Integration tests running</li>
      </ul>
    ),
  },
};
