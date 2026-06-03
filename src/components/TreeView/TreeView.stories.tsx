import type {Meta, StoryObj} from '@storybook/react-vite';
import {
  BadgeCheck,
  Box,
  Code,
  Database,
  File,
  FileText,
  Folder,
  Globe,
  Lock,
  Settings,
} from 'lucide-react';
import {fn} from 'storybook/test';
import {Badge} from '../Badge';
import {Icon} from '../Icon';
import {HStack, VStack} from '../Stack';
import {Text} from '../Text';
import {TreeView} from './TreeView';
import type {TreeViewItemData} from './types';

const basicItems: TreeViewItemData[] = [
  {id: 'overview', label: 'Overview'},
  {id: 'analytics', label: 'Analytics'},
  {id: 'settings', label: 'Settings'},
];

const nestedItems: TreeViewItemData[] = [
  {
    id: 'src',
    label: 'src',
    children: [
      {id: 'src-components', label: 'components'},
      {id: 'src-hooks', label: 'hooks'},
      {id: 'src-utils', label: 'utils'},
    ],
  },
  {
    id: 'docs',
    label: 'docs',
    children: [
      {id: 'docs-api', label: 'api.md'},
      {id: 'docs-guide', label: 'guide.md'},
    ],
  },
];

const initiallyExpandedItems: TreeViewItemData[] = [
  {
    id: 'workspace',
    isExpanded: true,
    label: 'workspace',
    children: [
      {
        id: 'workspace-app',
        isExpanded: true,
        label: 'app',
        children: [
          {id: 'workspace-app-page', label: 'page.tsx'},
          {id: 'workspace-app-layout', label: 'layout.tsx'},
        ],
      },
      {id: 'workspace-config', label: 'config.ts'},
    ],
  },
];

const deeplyNestedItems: TreeViewItemData[] = [
  {
    id: 'level-1',
    isExpanded: true,
    label: 'Level 1',
    children: [
      {
        id: 'level-2',
        isExpanded: true,
        label: 'Level 2',
        children: [
          {
            id: 'level-3',
            isExpanded: true,
            label: 'Level 3',
            children: [
              {
                id: 'level-4',
                isExpanded: true,
                label: 'Level 4',
                children: [{id: 'level-5', label: 'Level 5'}],
              },
            ],
          },
        ],
      },
    ],
  },
];

const meta = {
  title: 'Components/TreeView',
  component: TreeView,
  args: {
    density: 'balanced',
    items: basicItems,
  },
  argTypes: {
    density: {
      control: {type: 'select'},
      options: ['balanced', 'compact', 'spacious'],
    },
  },
} satisfies Meta<typeof TreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const Nested: Story = {
  args: {
    items: nestedItems,
  },
};

export const InitiallyExpanded: Story = {
  args: {
    items: initiallyExpandedItems,
  },
};

export const WithDescriptions: Story = {
  args: {
    items: [
      {
        id: 'api',
        label: 'API',
        description: 'Public component contracts and generated types.',
      },
      {
        id: 'fixtures',
        label: 'Fixtures',
        description: 'Shared example data used by tests and stories.',
      },
      {
        id: 'migrations',
        label: 'Migrations',
        description: 'Schema changes that need review before deploy.',
      },
    ],
  },
};

export const WithStartAndEndContent: Story = {
  args: {
    items: [
      {
        id: 'components',
        label: 'components',
        startContent: <Icon color="secondary" icon={Folder} size="sm" />,
        endContent: <Badge color="info" label="24" size="sm" />,
      },
      {
        id: 'database',
        label: 'database',
        startContent: <Icon color="secondary" icon={Database} size="sm" />,
        endContent: <Badge color="warning" label="Review" size="sm" />,
      },
      {
        id: 'deploy',
        label: 'deploy',
        startContent: <Icon color="success" icon={BadgeCheck} size="sm" />,
        endContent: <Badge color="success" label="Ready" size="sm" />,
      },
    ],
  },
};

export const ActionItems: Story = {
  args: {
    items: [
      {id: 'open', label: 'Open project', onClick: fn()},
      {id: 'rename', label: 'Rename folder', onClick: fn()},
      {id: 'archive', label: 'Archive workspace', onClick: fn()},
    ],
  },
};

export const LinkItems: Story = {
  args: {
    items: [
      {href: '/docs', id: 'docs', label: 'Documentation'},
      {
        href: 'https://example.com',
        id: 'external',
        label: 'External status page',
        target: '_blank',
      },
      {href: '/settings/billing', id: 'billing', label: 'Billing settings'},
    ],
  },
};

export const DisabledItems: Story = {
  args: {
    items: [
      {id: 'available', label: 'Available'},
      {id: 'locked', isDisabled: true, label: 'Locked'},
      {
        id: 'disabled-parent',
        isDisabled: true,
        label: 'Disabled parent',
        children: [{id: 'disabled-child', label: 'Child'}],
      },
    ],
  },
};

export const SelectedItems: Story = {
  args: {
    items: [
      {id: 'inbox', label: 'Inbox'},
      {id: 'assigned', isSelected: true, label: 'Assigned to me'},
      {id: 'completed', label: 'Completed'},
    ],
  },
};

export const Density: Story = {
  render: () => (
    <HStack align="start" gap={6}>
      <VStack align="stretch" gap={2}>
        <Text weight="semibold">Balanced</Text>
        <TreeView density="balanced" items={basicItems} />
      </VStack>
      <VStack align="stretch" gap={2}>
        <Text weight="semibold">Compact</Text>
        <TreeView density="compact" items={basicItems} />
      </VStack>
      <VStack align="stretch" gap={2}>
        <Text weight="semibold">Spacious</Text>
        <TreeView density="spacious" items={basicItems} />
      </VStack>
    </HStack>
  ),
};

export const WithHeader: Story = {
  args: {
    header: <Text weight="semibold">Project files</Text>,
    items: nestedItems,
  },
};

export const DeeplyNested: Story = {
  args: {
    items: deeplyNestedItems,
  },
};

export const MixedInteractive: Story = {
  args: {
    items: [
      {
        id: 'package',
        label: 'package.json',
        startContent: <Icon color="secondary" icon={Code} size="sm" />,
        onClick: fn(),
        children: [
          {id: 'package-scripts', label: 'scripts', onClick: fn()},
          {id: 'package-deps', label: 'dependencies', onClick: fn()},
        ],
      },
      {
        id: 'assets',
        label: 'assets',
        startContent: <Icon color="secondary" icon={Box} size="sm" />,
        onClick: fn(),
        children: [
          {
            id: 'assets-icons',
            label: 'icons',
            startContent: <Icon color="secondary" icon={File} size="sm" />,
          },
          {
            id: 'assets-copy',
            label: 'copy.json',
            startContent: <Icon color="secondary" icon={FileText} size="sm" />,
          },
        ],
      },
      {
        href: '/settings/security',
        id: 'security',
        label: 'security',
        startContent: <Icon color="secondary" icon={Lock} size="sm" />,
      },
      {
        href: 'https://example.com/status',
        id: 'status',
        label: 'service status',
        startContent: <Icon color="secondary" icon={Globe} size="sm" />,
        target: '_blank',
      },
      {
        id: 'preferences',
        label: 'preferences',
        startContent: <Icon color="secondary" icon={Settings} size="sm" />,
        onClick: fn(),
      },
    ],
  },
};
