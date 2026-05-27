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
    <a ref={ref} data-story-link {...props}>
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
