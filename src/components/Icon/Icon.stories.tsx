import type {Meta, StoryObj} from '@storybook/react-vite';
import {Home} from 'lucide-react';
import {Icon, type IconColor, type IconSize} from 'components/Icon/Icon';
import {Text} from 'components/Text';
import {css} from 'styled-system/css';

const sizes: IconSize[] = ['sm', 'md', 'lg'];
const colors: IconColor[] = [
  'primary',
  'secondary',
  'tertiary',
  'disabled',
  'accent',
  'success',
  'error',
  'warning',
  'inherit',
  'blue',
  'red',
  'green',
  'gray',
  'cyan',
  'teal',
  'yellow',
  'orange',
  'pink',
  'purple',
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
};

const meta: Meta<typeof Icon> = {
  title: 'Components/Icon',
  component: Icon,
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
    color: 'primary',
    icon: Home,
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
        <Icon key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Colors: Story = {
  render: args => (
    <div className={styles.grid}>
      {colors.map(color => (
        <div className={styles.colorItem} key={color}>
          <Icon {...args} color={color} />
          <Text>{color}</Text>
        </div>
      ))}
    </div>
  ),
};
