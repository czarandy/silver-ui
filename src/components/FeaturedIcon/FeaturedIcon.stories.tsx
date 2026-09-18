import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, Info, Sparkles, TriangleAlert, X} from 'lucide-react';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {EmptyState} from 'components/EmptyState';
import {
  FeaturedIcon,
  type FeaturedIconColor,
  type FeaturedIconSize,
} from 'components/FeaturedIcon/FeaturedIcon';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const sizes: FeaturedIconSize[] = ['sm', 'md', 'lg'];
const colors: FeaturedIconColor[] = [
  'accent',
  'success',
  'error',
  'warning',
  'info',
  'blue',
  'cyan',
  'gray',
  'green',
  'orange',
  'pink',
  'purple',
  'red',
  'teal',
  'yellow',
];

const styles = {
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: '4',
    flexWrap: 'wrap',
  }),
  grid: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '3',
    maxW: '720px',
  }),
  colorItem: css({
    display: 'flex',
    alignItems: 'center',
    gap: '2',
  }),
  card: css({
    maxW: '420px',
  }),
};

const meta: Meta<typeof FeaturedIcon> = {
  title: 'Components/FeaturedIcon',
  component: FeaturedIcon,
  argTypes: {
    color: {
      control: {type: 'select'},
      options: colors,
    },
    size: {
      control: {type: 'select'},
      options: sizes,
    },
  },
  args: {
    color: 'accent',
    icon: Sparkles,
    size: 'md',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: args => (
    <div className={styles.row}>
      {sizes.map(size => (
        <FeaturedIcon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: args => (
    <div className={styles.grid}>
      {colors.map(color => (
        <div className={styles.colorItem} key={color}>
          <FeaturedIcon {...args} color={color} />
          <Text>{color}</Text>
        </div>
      ))}
    </div>
  ),
};

export const Statuses: Story = {
  render: args => (
    <div className={styles.row}>
      <FeaturedIcon {...args} color="success" icon={Check} />
      <FeaturedIcon {...args} color="error" icon={X} />
      <FeaturedIcon {...args} color="warning" icon={TriangleAlert} />
      <FeaturedIcon {...args} color="info" icon={Info} />
    </div>
  ),
};

export const InEmptyState: Story = {
  render: () => (
    <Card className={styles.card}>
      <EmptyState
        actions={<Button label="Return home" variant="primary" />}
        description="This link is no longer valid. Please use the link from your most recent reminder."
        headingLevel={2}
        illustration={<FeaturedIcon color="error" icon={X} size="lg" />}
        title="Response link unavailable"
      />
    </Card>
  ),
};
