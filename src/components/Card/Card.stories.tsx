import type {Meta, StoryObj} from '@storybook/react-vite';
import {css} from 'styled-system/css';
import {Button} from '../Button';
import {Divider} from '../Divider';
import {Layout} from '../Layout';
import {LayoutContent} from '../Layout/LayoutContent';
import {LayoutFooter} from '../Layout/LayoutFooter';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {LayoutPanel} from '../Layout/LayoutPanel';
import {Text} from '../Text';
import type {CardVariant} from './Card';
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
        'section',
        'transparent',
        'muted',
      ] satisfies CardVariant[],
    },
    color: {
      control: {type: 'select'},
      options: [
        undefined,
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
      {(['default', 'section', 'transparent', 'muted'] as const).map(
        variant => (
          <Card key={variant} padding={4} variant={variant}>
            <Text type="body">{variant}</Text>
          </Card>
        ),
      )}
    </div>
  ),
};

export const Colors: Story = {
  render: () => (
    <div
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)'}}>
      {(
        [
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
      ).map(color => (
        <Card color={color} key={color} padding={4}>
          <Text type="body">{color}</Text>
        </Card>
      ))}
    </div>
  ),
};

const containerStyle = css({
  borderWidth: 'default',
  borderStyle: 'solid',
  borderColor: 'border',
  borderRadius: 'lg',
  overflow: 'hidden',
});

export const Section: Story = {
  render: () => (
    <div className={containerStyle} style={{width: 400}}>
      <Card padding={4} variant="section">
        <Text type="body">
          A section card has no border or border-radius, making it suitable for
          use inside a larger container.
        </Text>
      </Card>
      <Divider />
      <Card padding={4} variant="section">
        <Text type="body">Another section</Text>
      </Card>
      <Divider />
      <Card color="blue" padding={4} variant="section">
        <Text type="body">Section with color</Text>
      </Card>
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
          <LayoutFooter
            primaryButton={<Button label="Save" variant="primary" />}
            secondaryButton={<Button label="Cancel" variant="ghost" />}
          />
        }
        header={<LayoutHeader title="Settings" />}
        start={
          <LayoutPanel width={160}>
            <Text type="body">Sidebar</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};
