import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, ChevronRight, Settings, Star, User} from 'lucide-react';
import {css} from 'styled-system/css';
import type {SpacingToken} from '../../internal/spacingTokens';
import {Badge} from '../Badge';
import {Button} from '../Button';
import {Divider} from '../Divider';
import {Icon} from '../Icon';
import {Layout} from '../Layout';
import {LayoutContent} from '../Layout/LayoutContent';
import {LayoutFooter} from '../Layout/LayoutFooter';
import {LayoutHeader} from '../Layout/LayoutHeader';
import {LayoutPanel} from '../Layout/LayoutPanel';
import {HStack, VStack} from '../Stack';
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
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(4, 1fr)'}}>
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
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(5, 1fr)'}}>
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

export const Padding: Story = {
  render: () => {
    const steps: SpacingToken[] = [0, 1, 2, 3, 4, 6, 8, 10];
    return (
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
        {steps.map(step => (
          <Card key={step} padding={step}>
            <div
              className={css({
                bg: 'surface.blue',
                borderRadius: 'md',
                p: '2',
              })}>
              <Text type="supporting">{`padding={${step}}`}</Text>
            </div>
          </Card>
        ))}
      </div>
    );
  },
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

export const FullBleedDivider: Story = {
  render: () => (
    <Card padding={4} style={{width: 360}}>
      <VStack gap={3}>
        <Text type="body">Content above the divider</Text>
        <Divider isFullBleed />
        <Text type="body">
          The divider stretches to the card edges using the{' '}
          <code>--card-padding</code> custom property.
        </Text>
      </VStack>
    </Card>
  ),
};

export const Nested: Story = {
  render: () => (
    <Card padding={4} style={{width: 480}}>
      <VStack gap={3}>
        <Text type="label">Outer card</Text>
        <div style={{display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr'}}>
          <Card color="blue" padding={3}>
            <Text type="supporting">Nested blue</Text>
          </Card>
          <Card color="green" padding={3}>
            <Text type="supporting">Nested green</Text>
          </Card>
        </div>
        <Card padding={3} variant="muted">
          <Text type="supporting">Nested muted card</Text>
        </Card>
      </VStack>
    </Card>
  ),
};

export const RichContent: Story = {
  render: () => (
    <Card padding={4} style={{width: 360}}>
      <VStack gap={3}>
        <HStack align="center" gap={3} justify="between">
          <HStack align="center" gap={2}>
            <Icon color="accent" icon={Star} />
            <Text type="label">Featured project</Text>
          </HStack>
          <Badge color="success" label="Active" />
        </HStack>
        <Text color="secondary" type="body">
          A short description of the project with enough detail to understand
          what it does at a glance.
        </Text>
        <Divider isFullBleed />
        <HStack gap={2} justify="end">
          <Button label="Details" size="sm" variant="ghost" />
          <Button label="Open" size="sm" variant="primary" />
        </HStack>
      </VStack>
    </Card>
  ),
};

export const Clickable: Story = {
  render: () => (
    <Card
      className={css({cursor: 'pointer', _hover: {borderColor: 'primary'}})}
      onClick={() => {}}
      padding={4}
      role="button"
      style={{width: 360}}
      tabIndex={0}>
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
    </Card>
  ),
};

export const CardList: Story = {
  render: () => {
    const items = [
      {icon: User, title: 'Profile', description: 'Edit your personal info'},
      {icon: Bell, title: 'Notifications', description: 'Configure alerts'},
      {icon: Settings, title: 'Settings', description: 'App preferences'},
    ];

    return (
      <VStack gap={2} style={{width: 400}}>
        {items.map(item => (
          <Card key={item.title} padding={3}>
            <HStack align="center" gap={3}>
              <Icon icon={item.icon} />
              <VStack gap={0}>
                <Text type="label">{item.title}</Text>
                <Text color="secondary" type="supporting">
                  {item.description}
                </Text>
              </VStack>
            </HStack>
          </Card>
        ))}
      </VStack>
    );
  },
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
