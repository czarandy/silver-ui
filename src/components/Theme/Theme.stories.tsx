import type {Meta, StoryObj} from '@storybook/react-vite';
import {Bell, Search} from 'lucide-react';
import {Alert} from '../Alert';
import {Badge, type BadgeColor} from '../Badge';
import {Button} from '../Button';
import {Card} from '../Card';
import {HStack, VStack} from '../Stack';
import {Switch} from '../Switch';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {Theme} from './Theme';

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
          <Badge color="neutral" label="Neutral" size="lg" />
          <Badge color="success" label="Ready" size="lg" />
          <Badge color="warning" label="Review" size="lg" />
          <Badge color="error" label="Blocked" size="lg" />
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
    <Theme
      tokens={{
        colors: {
          bg: '#ffffff',
          bgHover: '#f5f5f5',
          bgSelected: '#f1f1f1',
          bgSubtle: '#f1f1f1',
          border: '#ebebeb',
          borderEmphasized: '#d4d4d4',
          destructive: '#facecb',
          destructiveActive: '#e6bab8',
          destructiveFg: '#a50c25',
          destructiveHover: '#f8bab5',
          fg: '#171717',
          fgDisabled: '#a3a3a3',
          fgMuted: '#737373',
          fgOnPrimary: '#ffffff',
          primary: '#262626',
          primaryActive: '#0a0a0a',
          primaryHover: '#171717',
          primarySubtle: '#f1f1f1',
        },
        fonts: {
          body: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        radii: {
          componentLg: '0.75rem',
          componentMd: '0.625rem',
          componentSm: '0.375rem',
        },
      }}>
      <ThemePreview>
        <ComponentPreview previewBadgeColor="neutral" />
      </ThemePreview>
    </Theme>
  ),
};

export const DailyTheme: Story = {
  render: () => (
    <Theme
      tokens={{
        colors: {
          bg: '#ffffff',
          bgHover: '#e6e3de',
          bgSelected: '#1779fa40',
          bgSubtle: '#f8f4ed',
          border: '#e6e3de',
          borderEmphasized: '#85817a',
          destructive: '#fd000040',
          destructiveActive: '#fd000073',
          destructiveFg: '#fd0000',
          destructiveHover: '#fd00005a',
          fg: '#292724',
          fgDisabled: '#c9c6c1',
          fgMuted: '#85817a',
          fgOnPrimary: '#ffffff',
          primary: '#292724',
          primaryActive: '#121110',
          primaryHover: '#1a1917',
          primarySubtle: '#1779fa40',
        },
        fonts: {
          body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        radii: {
          componentLg: '18px',
          componentMd: '12px',
          componentSm: '6px',
        },
      }}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const SolarizedLightTheme: Story = {
  render: () => (
    <Theme
      tokens={{
        colors: {
          bg: '#fdf6e3',
          bgHover: '#e3dcc3',
          bgSelected: '#d7e9ef',
          bgSubtle: '#eee8d5',
          border: '#d6cfb7',
          borderEmphasized: '#93a1a1',
          destructive: '#f4d8d1',
          destructiveActive: '#e7aaa1',
          destructiveFg: '#dc322f',
          destructiveHover: '#edc5bd',
          fg: '#586e75',
          fgDisabled: '#93a1a1',
          fgMuted: '#657b83',
          fgOnPrimary: '#fdf6e3',
          primary: '#268bd2',
          primaryActive: '#1d6fa7',
          primaryHover: '#217ebf',
          primarySubtle: '#d7e9ef',
          surfaceGray: '#e7dec3',
          surfaceGrayHover: '#ddd4b9',
        },
        fonts: {
          body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        radii: {
          componentLg: '0.5rem',
          componentMd: '0.375rem',
          componentSm: '0.25rem',
        },
      }}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};
