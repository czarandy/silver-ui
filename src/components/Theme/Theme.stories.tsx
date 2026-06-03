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
      themes={{
        dark: {
          colors: {
            bg: '#1b1b1b',
            bgHover: '#525252',
            bgSelected: '#262626',
            bgSubtle: '#262626',
            border: '#ffffff1a',
            borderEmphasized: '#525252',
            fg: '#fafafa',
            fgDisabled: '#525252',
            fgMuted: '#a3a3a3',
            fgOnPrimary: '#171717',
            primary: '#ebebeb',
            primaryActive: '#d4d4d4',
            primaryHover: '#f5f5f5',
            primarySubtle: '#262626',
            surfaceGray: '#ffffff1a',
            surfaceGrayFg: '#e5e5e5',
            surfaceGrayHover: '#262626',
          },
          fonts: {
            body: 'Figtree, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          radii: {
            componentLg: '0.75rem',
            componentMd: '0.625rem',
            componentSm: '0.375rem',
          },
        },
        light: {
          colors: {
            bg: '#ffffff',
            bgHover: '#f5f5f5',
            bgSelected: '#f1f1f1',
            bgSubtle: '#f1f1f1',
            border: '#ebebeb',
            borderEmphasized: '#d4d4d4',
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
      themes={{
        dark: {
          colors: {
            bg: '#1a1917',
            bgHover: '#3a3733',
            bgSelected: '#1779fa40',
            bgSubtle: '#121110',
            border: '#f8f4ed1a',
            borderEmphasized: '#5c5955',
            destructive: '#ff5c5c',
            destructiveActive: '#ff8a8a',
            destructiveFg: '#ffffff',
            destructiveHover: '#ff7373',
            fg: '#f8f4ed',
            fgDisabled: '#5c5955',
            fgMuted: '#a19d96',
            fgOnPrimary: '#292724',
            primary: '#f8f4ed',
            primaryActive: '#c9c6c1',
            primaryHover: '#e6e3de',
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
        },
        light: {
          colors: {
            bg: '#ffffff',
            bgHover: '#e6e3de',
            bgSelected: '#1779fa40',
            bgSubtle: '#f8f4ed',
            border: '#e6e3de',
            borderEmphasized: '#85817a',
            destructive: '#fd0000',
            destructiveActive: '#b80000',
            destructiveFg: '#ffffff',
            destructiveHover: '#d90000',
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
        },
      }}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};

export const SolarizedTheme: Story = {
  render: () => (
    <Theme
      themes={{
        dark: {
          colors: {
            bg: '#002b36',
            bgHover: '#164450',
            bgSelected: '#073642',
            bgSubtle: '#073642',
            border: '#164450',
            borderEmphasized: '#586e75',
            destructive: '#dc322f',
            destructiveActive: '#ff6f6b',
            destructiveFg: '#fdf6e3',
            destructiveHover: '#e24b48',
            fg: '#839496',
            fgDisabled: '#586e75',
            fgMuted: '#93a1a1',
            fgOnPrimary: '#002b36',
            primary: '#268bd2',
            primaryActive: '#5aa6da',
            primaryHover: '#3a98d8',
            primarySubtle: '#073642',
            surfaceGray: '#073642',
            surfaceGrayFg: '#93a1a1',
            surfaceGrayHover: '#0b4652',
          },
          fonts: {
            body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          },
          radii: {
            componentLg: '0.5rem',
            componentMd: '0.375rem',
            componentSm: '0.25rem',
          },
        },
        light: {
          colors: {
            bg: '#fdf6e3',
            bgHover: '#e3dcc3',
            bgSelected: '#d7e9ef',
            bgSubtle: '#eee8d5',
            border: '#d6cfb7',
            borderEmphasized: '#93a1a1',
            destructive: '#dc322f',
            destructiveActive: '#a92826',
            destructiveFg: '#fdf6e3',
            destructiveHover: '#c72d2a',
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
        },
      }}>
      <ThemePreview>
        <ComponentPreview />
      </ThemePreview>
    </Theme>
  ),
};
