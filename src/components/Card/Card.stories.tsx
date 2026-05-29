import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {Layout} from '../Layout';
import {LayoutContent} from '../Layout/LayoutContent';
import {LayoutFooter} from '../Layout/LayoutFooter';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {LayoutPanel} from '../Layout/LayoutPanel';
import {HStack} from '../Stack';
import {Heading, Text} from '../Text';
import {Card} from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'default',
    padding: 4,
  },
  argTypes: {
    variant: {
      control: {type: 'select'},
      options: [
        'default',
        'transparent',
        'muted',
        'blue',
        'cyan',
        'gray',
        'green',
        'orange',
        'pink',
        'purple',
        'red',
        'teal',
        'yellow',
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <Card {...args} style={{width: 360}}>
      <Text type="body">Card content</Text>
    </Card>
  ),
};

export const Variants: Story = {
  render: () => (
    <div
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)'}}>
      {(
        [
          'default',
          'transparent',
          'muted',
          'blue',
          'cyan',
          'gray',
          'green',
          'orange',
          'pink',
          'purple',
          'red',
          'teal',
          'yellow',
        ] as const
      ).map(variant => (
        <Card key={variant} padding={4} variant={variant}>
          <Text type="body">{variant}</Text>
        </Card>
      ))}
    </div>
  ),
};

export const WithLayout: Story = {
  render: () => (
    <Card style={{height: 360, width: 600}}>
      <Layout
        content={
          <LayoutContent>
            <Text type="body">Main content area</Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <HStack gap={2} justify="end">
              <Button label="Cancel" variant="ghost" />
              <Button label="Save" variant="primary" />
            </HStack>
          </LayoutFooter>
        }
        header={
          <LayoutHeader>
            <Heading level={3}>Settings</Heading>
          </LayoutHeader>
        }
        start={
          <LayoutPanel width={160}>
            <Text type="body">Sidebar</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};
