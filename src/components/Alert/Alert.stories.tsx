import type {Meta, StoryObj} from '@storybook/react-vite';
import {Rocket} from 'lucide-react';
import {Alert} from 'components/Alert/Alert';
import {Button} from 'components/Button';
import {Icon} from 'components/Icon';
import {List, ListItem} from 'components/List';
import {Text} from 'components/Text';

const meta = {
  title: 'Components/Alert',
  component: Alert,
  args: {
    status: 'info',
    title: 'This is an informational alert',
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Statuses: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Alert status="info" title="Info — something to be aware of" />
      <Alert status="success" title="Success — operation completed" />
      <Alert status="warning" title="Warning — proceed with caution" />
      <Alert status="error" title="Error — something went wrong" />
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    title: 'Update available',
    description:
      'A new version has been released. Please update at your earliest convenience.',
    status: 'info',
  },
};

export const LongUnbrokenContent: Story = {
  args: {
    title:
      'Webhook failed for https://hooks.example.com/services/T0000000/B0000000/XXXXXXXXXXXXXXXXXXXXXXXX',
    description:
      'Request id req_01HZX3Q9K7M2N4P6R8T0V2W4Y6A8C0E2G4J6L8N0Q2S4U6W8Y0B2D4F6H8K0M2 could not be delivered.',
    status: 'error',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Long unbroken tokens such as URLs and request ids wrap inside the card instead of overflowing it, at any viewport width.',
      },
    },
  },
};

export const BlockDescription: Story = {
  args: {
    title: 'Before you continue',
    status: 'warning',
    description: (
      <List listStyle="disc">
        <ListItem label="Back up your data before proceeding." />
        <ListItem label="Ensure all team members are notified." />
        <ListItem label="This action cannot be undone." />
      </List>
    ),
  },
};

export const Dismissable: Story = {
  args: {
    title: 'Tip of the day',
    description: 'You can dismiss this alert by clicking the X button.',
    status: 'info',
    isDismissable: true,
  },
};

export const WithChildren: Story = {
  args: {
    title: 'Deployment summary',
    status: 'success',
    children: (
      <Text>
        3 services deployed successfully across 2 regions. No rollback actions
        were needed. Check the deployment dashboard for detailed metrics.
      </Text>
    ),
  },
};

export const DefaultExpanded: Story = {
  args: {
    title: 'Deployment summary',
    status: 'success',
    isDefaultExpanded: true,
    children: (
      <Text>
        3 services deployed successfully across 2 regions. No rollback actions
        were needed. Check the deployment dashboard for detailed metrics.
      </Text>
    ),
  },
};

export const WithEndContent: Story = {
  args: {
    title: 'New version available',
    status: 'info',
    endContent: <Button label="Update now" size="sm" variant="ghost" />,
  },
};

export const CenteredEndContent: Story = {
  args: {
    title: 'Your trial ends in 3 days',
    description:
      'Choose a plan now to keep your workspace and team access active after the trial ends.',
    status: 'warning',
    endContentAlignment: 'center',
    endContent: <Button label="Upgrade plan" size="sm" variant="primary" />,
  },
};

export const WithPrimaryAction: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Alert
        endContent={<Button label="Update now" size="sm" variant="primary" />}
        status="info"
        title="A new version is available"
      />
      <Alert
        endContent={<Button label="Download" size="sm" variant="primary" />}
        status="success"
        title="Your export is ready"
      />
      <Alert
        endContent={<Button label="Upgrade plan" size="sm" variant="primary" />}
        status="warning"
        title="Your trial ends in 3 days"
      />
      <Alert
        endContent={
          <Button label="Update payment" size="sm" variant="primary" />
        }
        status="error"
        title="Payment failed"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use a `primary` button in `endContent` when the alert is steering the ' +
          'reader toward one recommended action. No extra styling is needed: the ' +
          'alert retints `primary` with its own status colours, so the action ' +
          'inverts the surface it sits on instead of dropping the global accent ' +
          'onto it. Prefer a `ghost` button (see **With End Content**) for actions ' +
          'that are merely available, so a stack of alerts does not compete for ' +
          'attention.',
      },
    },
  },
};

export const WithSecondaryAction: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Alert
        endContent={
          <>
            <Button label="Later" size="sm" variant="secondary" />
            <Button label="Update now" size="sm" variant="primary" />
          </>
        }
        status="info"
        title="A new version is available"
      />
      <Alert
        endContent={
          <>
            <Button label="View details" size="sm" variant="secondary" />
            <Button label="Download" size="sm" variant="primary" />
          </>
        }
        status="success"
        title="Your export is ready"
      />
      <Alert
        endContent={
          <>
            <Button label="Not now" size="sm" variant="secondary" />
            <Button label="Upgrade plan" size="sm" variant="primary" />
          </>
        }
        status="warning"
        title="Your trial ends in 3 days"
      />
      <Alert
        endContent={
          <>
            <Button label="Cancel" size="sm" variant="secondary" />
            <Button label="Update payment" size="sm" variant="primary" />
          </>
        }
        status="error"
        title="Payment failed"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'A `secondary` button in `endContent` automatically adopts the alert status palette, ' +
          'using a quiet tonal fill alongside the stronger inverted `primary` action. No alert-specific ' +
          'button prop or custom styling is needed.',
      },
    },
  },
};

export const SectionContainer: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
      <Alert
        container="card"
        status="warning"
        title="Card container (default)"
      />
      <Alert container="section" status="warning" title="Section container" />
    </div>
  ),
};

export const CustomIcon: Story = {
  args: {
    title: 'Feature launched!',
    description: 'Your feature flag is now live in production.',
    status: 'success',
    icon: <Icon color="accent" icon={Rocket} />,
  },
};

export const KitchenSink: Story = {
  args: {
    title: 'System maintenance scheduled',
    description:
      'Services will be briefly unavailable during the upgrade window.',
    status: 'warning',
    isDismissable: true,
    isDefaultExpanded: true,
    endContent: <Button label="View schedule" size="sm" variant="ghost" />,
    children: (
      <Text>
        Maintenance is planned for Saturday 2:00–4:00 AM UTC. Affected services
        include authentication, billing, and notifications. Please save your
        work before the maintenance window begins.
      </Text>
    ),
  },
};
