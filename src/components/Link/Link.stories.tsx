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
      options: ['active', 'primary', 'secondary', 'inherit'],
    },
    hasUnderline: {control: 'boolean'},
    isDisabled: {control: 'boolean'},
    isExternalLink: {control: 'boolean'},
    isStandalone: {control: 'boolean'},
    children: {control: 'text'},
    href: {control: 'text'},
  },
  args: {
    children: 'Documentation',
    href: '/docs',
    isStandalone: true,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {color: 'active'},
};

export const Secondary: Story = {
  args: {color: 'secondary'},
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
