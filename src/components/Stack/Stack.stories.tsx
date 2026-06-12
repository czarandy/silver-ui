import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from 'components/Card';
import {HStack} from 'components/Stack/HStack';
import {VStack} from 'components/Stack/VStack';
import type {StackGap} from 'components/Stack/internal/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const meta: Meta<typeof HStack> = {
  title: 'Components/Stack',
  component: HStack,
};

export default meta;
type Story = StoryObj<typeof meta>;

const boxStyle = css({
  bg: 'bg.subtle',
  borderRadius: 'sm',
  px: '3',
  py: '2',
  borderWidth: 'default',
  borderColor: 'border',
});

function Box({children}: {children: React.ReactNode}) {
  return (
    <div className={boxStyle}>
      <Text type="body">{children}</Text>
    </div>
  );
}

export const Horizontal: Story = {
  render: () => (
    <HStack align="center" gap={3}>
      <Card>
        <Text type="body">One</Text>
      </Card>
      <Card>
        <Text type="body">Two</Text>
      </Card>
      <Card>
        <Text type="body">Three</Text>
      </Card>
    </HStack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <VStack gap={3}>
      <Card>
        <Text type="body">One</Text>
      </Card>
      <Card>
        <Text type="body">Two</Text>
      </Card>
      <Card>
        <Text type="body">Three</Text>
      </Card>
    </VStack>
  ),
};

export const GapScale: Story = {
  render: () => (
    <VStack gap={6}>
      {([0, 1, 2, 3, 4, 6, 8, 10] as StackGap[]).map(gap => (
        <VStack gap={1} key={gap}>
          <Text color="secondary" type="supporting">
            gap={String(gap)}
          </Text>
          <HStack gap={gap}>
            <Box>A</Box>
            <Box>B</Box>
            <Box>C</Box>
          </HStack>
        </VStack>
      ))}
    </VStack>
  ),
};

export const Wrap: Story = {
  render: () => (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text color="secondary" type="supporting">
          wrap
        </Text>
        <HStack gap={2} width={240} wrap="wrap">
          <Box>One</Box>
          <Box>Two</Box>
          <Box>Three</Box>
          <Box>Four</Box>
          <Box>Five</Box>
        </HStack>
      </VStack>
      <VStack gap={1}>
        <Text color="secondary" type="supporting">
          wrap-reverse
        </Text>
        <HStack gap={2} width={240} wrap="wrap-reverse">
          <Box>One</Box>
          <Box>Two</Box>
          <Box>Three</Box>
          <Box>Four</Box>
          <Box>Five</Box>
        </HStack>
      </VStack>
    </VStack>
  ),
};

export const Alignment: Story = {
  render: () => (
    <VStack gap={4}>
      <VStack gap={1}>
        <Text color="secondary" type="supporting">
          justify=&quot;between&quot;, align=&quot;center&quot;
        </Text>
        <HStack
          align="center"
          gap={2}
          height={80}
          justify="between"
          width={400}>
          <Box>Start</Box>
          <Box>Middle</Box>
          <Box>End</Box>
        </HStack>
      </VStack>
      <VStack gap={1}>
        <Text color="secondary" type="supporting">
          justify=&quot;center&quot;, align=&quot;end&quot;
        </Text>
        <HStack align="end" gap={2} height={80} justify="center" width={400}>
          <Box>A</Box>
          <Box>B</Box>
        </HStack>
      </VStack>
    </VStack>
  ),
};

export const PolymorphicElement: Story = {
  render: () => (
    <VStack gap={4}>
      <VStack aria-label="Main navigation" as="nav" gap={2}>
        <Text type="supporting">Rendered as &lt;nav&gt;</Text>
        <HStack gap={2}>
          <Box>Home</Box>
          <Box>About</Box>
          <Box>Contact</Box>
        </HStack>
      </VStack>
      <VStack as="ul" gap={1} style={{listStyle: 'none', padding: 0}}>
        <Text type="supporting">Rendered as &lt;ul&gt;</Text>
        <Box>Item 1</Box>
        <Box>Item 2</Box>
      </VStack>
    </VStack>
  ),
};

export const ExplicitSize: Story = {
  render: () => (
    <HStack gap={4}>
      <VStack gap={2} height={200} width={200}>
        <Box>Fixed 200×200</Box>
        <Box>Content</Box>
      </VStack>
      <VStack gap={2} height="10rem" width="50%">
        <Box>50% × 10rem</Box>
        <Box>Content</Box>
      </VStack>
    </HStack>
  ),
};

export const Nested: Story = {
  render: () => (
    <VStack gap={4}>
      <HStack gap={3}>
        <VStack gap={2}>
          <Box>Top Left</Box>
          <Box>Bottom Left</Box>
        </VStack>
        <VStack gap={2}>
          <Box>Top Right</Box>
          <Box>Bottom Right</Box>
        </VStack>
      </HStack>
      <HStack gap={3}>
        <Box>Footer Left</Box>
        <Box>Footer Right</Box>
      </HStack>
    </VStack>
  ),
};
