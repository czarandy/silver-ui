import type {Meta, StoryObj} from '@storybook/react-vite';
import type {ComponentPropsWithRef} from 'react';
import {Link} from './Link';
import {LinkProvider} from './LinkProvider';

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
