import type {Meta, StoryObj} from '@storybook/react-vite';
import {CircleDollarSign, Percent, ShoppingCart, Users} from 'lucide-react';
import {Card} from 'components/Card';
import {Stat, type StatProps} from 'components/Stat/Stat';
import {css} from 'styled-system/css';

const dashboardGrid = css({
  display: 'grid',
  gridTemplateColumns: {
    base: 'minmax(0, 1fr)',
    md: 'repeat(2, minmax(0, 1fr))',
    xl: 'repeat(4, minmax(0, 1fr))',
  },
  gap: '4',
});

const meta = {
  title: 'Components/Stat',
  component: Stat,
  args: {
    label: 'Revenue',
    value: '$1.2M',
  },
} satisfies Meta<StatProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    description: 'Reporting period ending June 30',
  },
};

export const WithIcon: Story = {
  args: {
    icon: CircleDollarSign,
  },
};

export const WithChange: Story = {
  args: {
    change: 12.5,
  },
};

export const InvertedChange: Story = {
  args: {
    change: -3.4,
    changeSentiment: 'inverted',
    description: 'Lower is better',
    label: 'Churn rate',
    value: '2.1%',
  },
};

export const CustomChangeText: Story = {
  args: {
    change: 340,
    formatChange: change => `+${change}`,
    increaseLabel: 'this month',
    label: 'Customers',
    value: '8,429',
  },
};

export const Dashboard: Story = {
  render: () => (
    <div className={dashboardGrid}>
      <Card padding={4}>
        <Stat
          change={12.5}
          description="Year to date"
          icon={CircleDollarSign}
          label="Revenue"
          value="$1.2M"
        />
      </Card>
      <Card padding={4}>
        <Stat
          change={8.2}
          description="Active accounts"
          icon={Users}
          label="Customers"
          value="8,429"
        />
      </Card>
      <Card padding={4}>
        <Stat
          change={-3.4}
          description="This month"
          icon={ShoppingCart}
          label="Orders"
          value="1,284"
        />
      </Card>
      <Card padding={4}>
        <Stat
          change={0}
          description="Last 30 days"
          icon={Percent}
          label="Conversion"
          value="4.8%"
        />
      </Card>
    </div>
  ),
};
