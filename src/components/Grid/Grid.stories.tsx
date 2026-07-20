import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from 'components/Card';
// Avoid Panda treating silver-ui's Grid JSX as its built-in grid pattern.
import {Grid as SilverGrid} from 'components/Grid/Grid';
import {VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const meta: Meta<typeof SilverGrid> = {
  title: 'Components/Grid',
  component: SilverGrid,
};

export default meta;
type Story = StoryObj<typeof meta>;

const cardClass = css({minH: '28'});
const cardNames = [
  'Analytics',
  'Billing',
  'Customers',
  'Inventory',
  'Orders',
  'Reports',
  'Settings',
  'Team',
];

function GalleryCards(): React.JSX.Element {
  return (
    <>
      {cardNames.map((name, index) => (
        <Card className={cardClass} key={name} padding={4}>
          <VStack gap={2}>
            <Text type="label">{name}</Text>
            <Text type="supporting">Card {index + 1}</Text>
          </VStack>
        </Card>
      ))}
    </>
  );
}

export const FixedColumns: Story = {
  render: () => (
    <SilverGrid columns={3} gap={4}>
      <GalleryCards />
    </SilverGrid>
  ),
};

export const ResponsiveColumns: Story = {
  render: () => (
    <VStack gap={4}>
      <Text type="body">
        Resize the viewport to see the gallery change from one to two to four
        columns.
      </Text>
      <SilverGrid columns={{base: 1, sm: 2, lg: 4}} gap={3}>
        <GalleryCards />
      </SilverGrid>
    </VStack>
  ),
};

export const AutoFit: Story = {
  render: () => (
    <VStack gap={4}>
      <Text type="body">
        Cards reflow automatically without configured breakpoints.
      </Text>
      <SilverGrid gap={5} minChildWidth={220}>
        <GalleryCards />
      </SilverGrid>
    </VStack>
  ),
};
