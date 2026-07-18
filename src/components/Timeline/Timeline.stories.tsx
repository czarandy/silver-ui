import {Temporal} from '@js-temporal/polyfill';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {Check, PackageCheck, Truck} from 'lucide-react';
import {Icon} from 'components/Icon';
import {Text} from 'components/Text';
import {
  Timeline,
  type TimelineItemConfig,
  type TimelineProps,
} from 'components/Timeline/Timeline';

const shippingItems: TimelineItemConfig[] = [
  {
    id: 'placed',
    timestamp: Temporal.Instant.from('2026-07-14T17:28:00Z'),
    title: 'Order placed',
    content: (
      <Text as="p" color="secondary" type="supporting">
        We received order #SIL-1048 and sent a confirmation email.
      </Text>
    ),
    icon: <Icon icon={Check} size="sm" />,
  },
  {
    id: 'shipped',
    timestamp: Temporal.Instant.from('2026-07-15T22:10:00Z'),
    title: 'Package shipped',
    content: (
      <Text as="p" color="secondary" type="supporting">
        The carrier picked up the package in Oakland, California.
      </Text>
    ),
    icon: <Icon icon={Truck} size="sm" />,
  },
  {
    id: 'delivered',
    timestamp: Temporal.Instant.from('2026-07-17T18:05:00Z'),
    title: 'Delivered',
    content: (
      <Text as="p" color="secondary" type="supporting">
        The package was left at the front door.
      </Text>
    ),
    icon: <Icon icon={PackageCheck} size="sm" />,
  },
];

const auditItems: TimelineItemConfig[] = [
  {
    id: 'created',
    timestamp: Temporal.Instant.from('2026-07-17T16:02:00Z'),
    title: 'Record created',
    content: 'Morgan created this customer record.',
  },
  {
    id: 'owner',
    timestamp: Temporal.Instant.from('2026-07-17T16:47:00Z'),
    title: 'Owner changed',
    content: 'The owner changed from Morgan to Taylor.',
  },
  {
    id: 'note',
    timestamp: Temporal.Instant.from('2026-07-17T18:12:00Z'),
    title: 'Note added',
    content: 'Taylor added a follow-up note.',
  },
];

const meta = {
  title: 'Components/Timeline',
  component: Timeline,
  args: {
    items: shippingItems,
    timestampFormat: 'auto',
  },
  argTypes: {
    timestampFormat: {
      control: {type: 'select'},
      options: [
        'auto',
        'relative',
        'date',
        'time',
        'dateTime',
        'systemDate',
        'systemTime',
        'systemDateTime',
      ],
    },
  },
} satisfies Meta<TimelineProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ShippingHistory: Story = {};

export const AuditLog: Story = {
  args: {items: auditItems},
};
