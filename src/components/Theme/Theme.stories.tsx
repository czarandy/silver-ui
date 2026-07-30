import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Search} from 'lucide-react';
import {Alert} from 'components/Alert';
import {Badge, type BadgeColor} from 'components/Badge';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {HStack, VStack} from 'components/Stack';
import {Switch} from 'components/Switch';
import {Text} from 'components/Text';
import {TextInput} from 'components/TextInput';
import {Theme} from 'components/Theme/Theme';
import {
  materialTheme,
  neutralTheme,
  nordTheme,
  solarizedTheme,
} from 'themes/presets';

const meta = {
  title: 'Components/Theme',
  component: Theme,
  args: {
    mode: 'system',
  },
  argTypes: {
    mode: {
      control: {type: 'select'},
      options: ['system', 'light', 'dark'],
    },
  },
} satisfies Meta<typeof Theme>;

export default meta;
type Story = StoryObj<typeof meta>;

function ComponentPreview({
  previewBadgeColor = 'info',
}: {
  previewBadgeColor?: BadgeColor;
}): React.JSX.Element {
  return (
    <Card
      padding={5}
      style={{
        background: 'var(--silver-colors-bg)',
        maxWidth: 760,
      }}>
      <VStack gap={5}>
        <HStack align="start" gap={4} justify="between" wrap="wrap">
          <VStack gap={1}>
            <Text as="div" type="large" weight="semibold">
              Workspace settings
            </Text>
            <Text as="p" color="secondary" type="body">
              A scoped theme updates Silver UI tokens for every component below.
            </Text>
          </VStack>
          <Badge color={previewBadgeColor} label="Preview" size="lg" />
        </HStack>

        <Alert
          description="Alerts, buttons, inputs, badges, and toggles all resolve through semantic tokens."
          status="info"
          title="Theme preview"
        />

        <HStack align="start" gap={4} wrap="wrap">
          <TextInput
            hasClear
            label="Project"
            onChange={() => {}}
            placeholder="Search projects"
            startIcon={Search}
            value="Apollo"
          />
          <TextInput
            label="Owner"
            onChange={() => {}}
            placeholder="Owner"
            value="Ada Lovelace"
          />
        </HStack>

        <HStack gap={2} wrap="wrap">
          <Badge color="neutral" label="Neutral" />
          <Badge color="success" label="Ready" />
          <Badge color="warning" label="Review" />
          <Badge color="error" label="Blocked" />
        </HStack>

        <Switch
          description="Use themed semantic tokens for interactive controls."
          isSelected
          label="Notifications"
          labelIcon={Bell}
          onChange={() => {}}
        />

        <HStack gap={3}>
          <Button label="Save changes" variant="primary" />
          <Button label="Cancel" variant="secondary" />
          <Button label="Delete" variant="destructive" />
        </HStack>
      </VStack>
    </Card>
  );
}

function ThemePreview({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div
      style={{
        background: 'var(--silver-colors-bg-subtle)',
        borderRadius: 'var(--silver-radii-component-lg)',
        padding: 24,
      }}>
      {children}
    </div>
  );
}

export const Default: Story = {
  render: args => (
    <Theme {...args}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const PrimaryColor: Story = {
  render: () => (
    <Theme
      tokens={{
        colors: {
          primary: 'purple-500',
          primaryActive: 'purple-700',
          primaryHover: 'purple-600',
          primarySubtle: 'purple-100',
        },
      }}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const NeutralTheme: Story = {
  render: () => (
    <Theme themes={neutralTheme.themes}>
      <ThemePreview>
        <ComponentPreview previewBadgeColor="neutral" />
      </ThemePreview>
    </Theme>
  ),
};

export const MaterialTheme: Story = {
  render: () => (
    <Theme themes={materialTheme.themes}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const NordTheme: Story = {
  render: () => (
    <Theme themes={nordTheme.themes}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const SolarizedTheme: Story = {
  render: () => (
    <Theme themes={solarizedTheme.themes}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};
