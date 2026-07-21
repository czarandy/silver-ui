import type {Meta, StoryObj} from '@storybook/react-vite';
import {Card} from 'components/Card';
import {Grid} from 'components/Grid';
import {VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const meta: Meta<typeof Grid> = {
  title: 'Components/Grid',
  component: Grid,
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
    <Grid columns={3} gap={4}>
      <GalleryCards />
    </Grid>
  ),
};

export const ResponsiveColumns: Story = {
  render: () => (
    <VStack gap={4}>
      <Text type="body">
        Resize the viewport to see the gallery change from one to two to four
        columns.
      </Text>
      <Grid columns={{base: 1, sm: 2, lg: 4}} gap={3}>
        <GalleryCards />
      </Grid>
    </VStack>
  ),
};

export const AutoFit: Story = {
  render: () => (
    <VStack gap={4}>
      <Text type="body">
        Cards reflow automatically without configured breakpoints.
      </Text>
      <Grid gap={5} minChildWidth={220}>
        <GalleryCards />
      </Grid>
    </VStack>
  ),
};

const narrowContainerClass = css({
  borderColor: 'border',
  borderStyle: 'solid',
  borderWidth: '1px',
  maxWidth: '240px',
});

export const AutoFitNarrowContainer: Story = {
  render: () => (
    <VStack gap={4}>
      <Text type="body">
        A minimum child width wider than its container clamps to the container
        width instead of overflowing it.
      </Text>
      <div className={narrowContainerClass}>
        <Grid gap={3} minChildWidth={320}>
          <GalleryCards />
        </Grid>
      </div>
    </VStack>
  ),
};
