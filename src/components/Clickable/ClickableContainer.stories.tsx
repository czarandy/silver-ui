import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from 'components/Button';
import {ClickableContainer} from 'components/Clickable/ClickableContainer';
import {Link} from 'components/Link';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const surfaceClassName = css({
  w: 'sm',
  p: '4',
  borderWidth: 'default',
  borderStyle: 'solid',
  borderColor: 'border',
  bg: 'bg',
});

const meta: Meta<typeof ClickableContainer> = {
  title: 'Components/ClickableContainer',
  component: ClickableContainer,
  args: {
    children: (
      <VStack gap={1}>
        <Text type="label">Quarterly report</Text>
        <Text color="secondary" type="supporting">
          Updated a few minutes ago
        </Text>
      </VStack>
    ),
    className: surfaceClassName,
    label: 'Open quarterly report',
    onClick: () => {},
    style: {borderRadius: 12},
  },
  argTypes: {
    isDisabled: {control: 'boolean'},
    isReadOnly: {control: 'boolean'},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Action: Story = {};

export const LinkSurface: Story = {
  args: {
    href: '/reports/quarterly',
    onClick: undefined,
  },
};

export const NestedControls: Story = {
  render: () => (
    <ClickableContainer
      className={surfaceClassName}
      href="/projects/apollo"
      label="Open Apollo project"
      style={{borderRadius: 12}}>
      <VStack gap={3}>
        <VStack gap={1}>
          <Text type="label">Apollo</Text>
          <Text color="secondary" type="supporting">
            Nested controls remain independent from the row action.
          </Text>
        </VStack>
        <HStack align="center" gap={3}>
          <Button label="Archive project" onClick={() => {}} size="sm" />
          <Link href="/projects/apollo/settings">Settings</Link>
        </HStack>
      </VStack>
    </ClickableContainer>
  ),
};

export const States: Story = {
  render: () => (
    <HStack align="start" gap={4} wrap="wrap">
      <ClickableContainer
        className={surfaceClassName}
        disabledReason="The report is still being generated"
        isDisabled
        label="Open pending report"
        onClick={() => {}}
        style={{borderRadius: 12}}>
        <Text type="label">Disabled surface</Text>
      </ClickableContainer>
      <ClickableContainer
        className={surfaceClassName}
        isReadOnly
        label="Read-only report"
        onClick={() => {}}
        style={{borderRadius: 12}}>
        <Text type="label">Read-only surface</Text>
      </ClickableContainer>
    </HStack>
  ),
};
