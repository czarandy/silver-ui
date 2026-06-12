import type {Meta, StoryObj} from '@storybook/react-vite';
import type {ComponentPropsWithRef} from 'react';
import {fn} from 'storybook/test';
import {Link} from 'components/Link/Link';
import {LinkProvider} from 'components/Link/LinkProvider';
import {Text} from 'components/Text';

function StoryLink({
  children,
  ref,
  ...props
}: ComponentPropsWithRef<'a'>): React.JSX.Element {
  return (
    <a data-story-link ref={ref} {...props}>
      {children}
    </a>
  );
}

const meta: Meta<typeof Link> = {
  title: 'Components/Link',
  component: Link,
  argTypes: {
    color: {
      control: {type: 'select'},
      options: [
        'primary',
        'secondary',
        'disabled',
        'placeholder',
        'active',
        'inherit',
      ],
    },
    weight: {
      control: {type: 'select'},
      options: ['normal', 'medium', 'semibold', 'bold', 'inherit'],
    },
    size: {
      control: {type: 'select'},
      options: [
        'xs',
        'sm',
        'md',
        'lg',
        'xl',
        '2xl',
        '3xl',
        '4xl',
        '5xl',
        '6xl',
        'inherit',
      ],
    },
    hasUnderline: {control: 'boolean'},
    isDisabled: {control: 'boolean'},
    isExternalLink: {control: 'boolean'},
    children: {control: 'text'},
    href: {control: 'text'},
    rel: {control: 'text'},
    target: {control: 'text'},
  },
  args: {
    children: 'Documentation',
    href: '/docs',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {color: 'active'},
};

export const Primary: Story = {
  args: {color: 'primary'},
};

export const Secondary: Story = {
  args: {color: 'secondary'},
};

export const Disabled: Story = {
  args: {color: 'disabled'},
};

export const Placeholder: Story = {
  args: {color: 'placeholder'},
};

export const Inherit: Story = {
  args: {color: 'inherit'},
};

export const WeightNormal: Story = {
  args: {weight: 'normal'},
};

export const WeightMedium: Story = {
  args: {weight: 'medium'},
};

export const WeightSemibold: Story = {
  args: {weight: 'semibold'},
};

export const WeightBold: Story = {
  args: {weight: 'bold'},
};

export const SizeSmall: Story = {
  args: {size: 'sm'},
};

export const SizeLarge: Story = {
  args: {size: 'lg'},
};

export const SizeXL: Story = {
  args: {size: 'xl'},
};

export const SizeInherit: Story = {
  args: {size: 'inherit'},
};

export const Underlined: Story = {
  args: {hasUnderline: true},
};

export const External: Story = {
  args: {
    children: 'External docs',
    href: 'https://example.com',
    isExternalLink: true,
  },
};

export const ExternalSameTab: Story = {
  args: {
    children: 'External docs in same tab',
    href: 'https://example.com',
    isExternalLink: true,
    target: '_self',
  },
};

export const ExternalWithLabel: Story = {
  args: {
    children: '↗',
    href: 'https://example.com/settings',
    isExternalLink: true,
    label: 'Open settings',
  },
};

export const ExternalUnderlined: Story = {
  args: {
    children: 'External underlined docs',
    hasUnderline: true,
    href: 'https://example.com/docs',
    isExternalLink: true,
  },
};

export const ProviderOverride: Story = {
  render: () => (
    <LinkProvider component={StoryLink}>
      <Link href="/provider">Provider link</Link>
    </LinkProvider>
  ),
};

export const AsOverride: Story = {
  render: () => (
    <Link as={StoryLink} href="/as-override">
      Direct custom link
    </Link>
  ),
};

export const InlineWithText: Story = {
  render: () => (
    <Text as="p">
      Read the <Link href="/docs">documentation</Link> before changing these
      settings.
    </Text>
  ),
};

export const WithOnClick: Story = {
  args: {
    children: 'Log click',
    href: undefined,
    onClick: fn(),
  },
};

export const WithoutHref: Story = {
  args: {
    children: 'Action-style link',
    href: undefined,
  },
};

export const TargetBlank: Story = {
  args: {
    children: 'Open report',
    href: 'https://example.com/report',
    target: '_blank',
  },
};

export const CustomRel: Story = {
  args: {
    children: 'Sponsored partner',
    href: 'https://example.com/partner',
    rel: 'sponsored',
    target: '_blank',
  },
};

export const IsDisabled: Story = {
  args: {
    children: 'Disabled link',
    isDisabled: true,
    tooltip: 'This link is unavailable for your current role.',
  },
};

export const WithTooltip: Story = {
  args: {
    children: 'Hover me',
    tooltip: 'Go to documentation',
  },
};

export const IconOnly: Story = {
  args: {
    children: '⚙',
    label: 'Settings',
  },
};

export const DisabledExternal: Story = {
  args: {
    children: 'Disabled external',
    href: 'https://example.com',
    isExternalLink: true,
    isDisabled: true,
  },
};
