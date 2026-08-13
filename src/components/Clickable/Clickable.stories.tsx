import type {Meta, StoryObj} from '@storybook/react-vite';
import type {ComponentPropsWithRef} from 'react';
import {Badge} from 'components/Badge';
import {Clickable} from 'components/Clickable/Clickable';
import {HStack} from 'components/Stack';

const meta: Meta<typeof Clickable> = {
  title: 'Components/Clickable',
  component: Clickable,
  args: {
    children: <Badge color="info" label="Engineering" />,
    label: 'Select Engineering',
    onClick: () => {},
  },
  argTypes: {
    isDisabled: {control: 'boolean'},
    isReadOnly: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Action: Story = {};

export const WithTooltip: Story = {
  args: {
    tooltip: 'Click to select the Engineering team',
  },
};

export const Link: Story = {
  args: {
    href: '/teams/engineering',
    label: 'View Engineering team',
    onClick: undefined,
  },
};

function RouterLink({
  children,
  ref,
  to,
  ...props
}: ComponentPropsWithRef<'a'> & {to?: string}): React.JSX.Element {
  return (
    <a data-router-destination={to} ref={ref} {...props}>
      {children}
    </a>
  );
}

export const CustomLink: Story = {
  args: {
    as: RouterLink,
    href: '/teams/design',
    children: <Badge color="purple" label="Design" />,
    label: 'View Design team',
    onClick: undefined,
  },
};

export const States: Story = {
  render: () => (
    <HStack align="center" gap={4}>
      <Clickable label="Enabled" onClick={() => {}}>
        <Badge color="success" label="Enabled" />
      </Clickable>
      <Clickable
        disabledReason="You do not have access to this team"
        isDisabled
        label="Disabled"
        onClick={() => {}}>
        <Badge color="neutral" label="Disabled" />
      </Clickable>
      <Clickable isReadOnly label="Read only" onClick={() => {}}>
        <Badge color="warning" label="Read only" />
      </Clickable>
    </HStack>
  ),
};

export const CustomRadius: Story = {
  args: {
    children: <Badge color="teal" label="Rounded" />,
    label: 'Select rounded item',
    style: {borderRadius: 9999},
  },
};
