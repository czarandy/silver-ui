import type {Meta, StoryObj} from '@storybook/react-vite';
import {ChevronLeft} from 'lucide-react';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {Layout} from 'components/Layout/Layout';
import {LayoutContent} from 'components/Layout/LayoutContent';
import {LayoutFooter} from 'components/Layout/LayoutFooter';
import {LayoutHeader} from 'components/Layout/LayoutHeader';
import {LayoutPanel} from 'components/Layout/LayoutPanel';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  args: {
    height: 'fill',
    padding: 0,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <div style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Main content</Text>
          </LayoutContent>
        }
        header={<LayoutHeader title="Header" />}
        start={
          <LayoutPanel width={220}>
            <Text type="body">Start panel</Text>
          </LayoutPanel>
        }
      />
    </div>
  ),
};

export const ContentOnly: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">
              This layout has only content, no header or panels.
            </Text>
          </LayoutContent>
        }
        hasDividers={false}
      />
    </Card>
  ),
};

export const AutoHeight: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <VStack gap={2}>
              <Text type="body">Auto-height layout grows with content.</Text>
              <Text type="body">No fixed height constraint.</Text>
              <Text type="body">The layout is only as tall as needed.</Text>
              <Text type="body">
                Additional content pushes the height further.
              </Text>
              <Text type="body">This demonstrates natural document flow.</Text>
            </VStack>
          </LayoutContent>
        }
        header={<LayoutHeader title="Header" />}
        height="auto"
      />
    </Card>
  ),
};

export const WithPadding: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Content with outer padding on the layout.</Text>
          </LayoutContent>
        }
        header={<LayoutHeader title="Header" />}
        padding={4}
      />
    </Card>
  ),
};

export const WithEndPanel: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Main content area</Text>
          </LayoutContent>
        }
        end={
          <LayoutPanel width={200}>
            <Text type="body">End panel</Text>
          </LayoutPanel>
        }
        start={
          <LayoutPanel width={200}>
            <Text type="body">Start panel</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};

export const WithFooter: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Main content</Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter
            primaryButton={<Button label="Save" variant="primary" />}
            secondaryButton={<Button label="Cancel" variant="ghost" />}
          />
        }
        header={<LayoutHeader title="Header" />}
      />
    </Card>
  ),
};

export const CustomFooter: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Main content</Text>
          </LayoutContent>
        }
        footer={
          <LayoutFooter>
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                gap: 12,
                justifyContent: 'space-between',
              }}>
              <Text color="secondary" type="body">
                Autosaved 2 minutes ago
              </Text>
              <div style={{display: 'flex', gap: 8}}>
                <Button label="Discard" variant="ghost" />
                <Button label="Publish" variant="primary" />
              </div>
            </div>
          </LayoutFooter>
        }
        header={<LayoutHeader title="Header" />}
      />
    </Card>
  ),
};

export const AllSlots: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Main content</Text>
          </LayoutContent>
        }
        end={
          <LayoutPanel width={180}>
            <Text type="body">End panel</Text>
          </LayoutPanel>
        }
        footer={
          <LayoutFooter
            primaryButton={<Button label="Save" variant="primary" />}
            secondaryButton={<Button label="Cancel" variant="ghost" />}
          />
        }
        header={<LayoutHeader title="Header" />}
        start={
          <LayoutPanel width={180}>
            <Text type="body">Start panel</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};

export const PanelWidth: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Start panel is 200px, end panel is 300px.</Text>
          </LayoutContent>
        }
        end={
          <LayoutPanel width={300}>
            <Text type="body">300px panel</Text>
          </LayoutPanel>
        }
        start={
          <LayoutPanel width={200}>
            <Text type="body">200px panel</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};

export const NoDividers: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">No dividers on any region.</Text>
          </LayoutContent>
        }
        hasDividers={false}
        header={<LayoutHeader title="Header" />}
        start={
          <LayoutPanel width={200}>
            <Text type="body">Start panel</Text>
          </LayoutPanel>
        }
      />
    </Card>
  ),
};

/**
 * A divider gives each region its own edge to pad against, so the header's
 * block-end padding and the content's block-start padding sit either side of
 * the rule. Without a divider those paddings would stack into a gap twice the
 * size of the surface's outer padding, so the content drops its own padding on
 * the edges that meet a header or footer and the regions read as one surface.
 */
export const RegionPadding: Story = {
  render: args => (
    <HStack gap={4}>
      <Card style={{height: 320, width: 280}}>
        <Layout
          {...args}
          content={
            <LayoutContent>
              <Text type="body">16px either side of each rule.</Text>
            </LayoutContent>
          }
          footer={<LayoutFooter primaryButton={<Button label="Save" />} />}
          hasDividers
          header={<LayoutHeader title="With dividers" />}
        />
      </Card>
      <Card style={{height: 320, width: 280}}>
        <Layout
          {...args}
          content={
            <LayoutContent>
              <Text type="body">16px under the title, not 32px.</Text>
            </LayoutContent>
          }
          footer={<LayoutFooter primaryButton={<Button label="Save" />} />}
          hasDividers={false}
          header={<LayoutHeader title="Without dividers" />}
        />
      </Card>
    </HStack>
  ),
};

export const NonScrollableContent: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent isScrollable={false}>
            <Text type="body">This content area does not scroll.</Text>
          </LayoutContent>
        }
        header={<LayoutHeader title="Header" />}
      />
    </Card>
  ),
};

export const ContentPadding: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent padding={8}>
            <Text type="body">
              This content has padding=8 for extra spacing.
            </Text>
          </LayoutContent>
        }
        header={<LayoutHeader title="Header (default padding)" />}
      />
    </Card>
  ),
};

export const HeaderSubtitle: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Header with supporting subtitle text.</Text>
          </LayoutContent>
        }
        header={
          <LayoutHeader
            subtitle="Manage your account preferences"
            title="Settings"
          />
        }
      />
    </Card>
  ),
};

export const HeaderLevel: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">
              Header title renders as a level 2 heading in this layout.
            </Text>
          </LayoutContent>
        }
        header={<LayoutHeader level={2} title="Account settings" />}
      />
    </Card>
  ),
};

export const HeaderActions: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">
              startContent holds a back button, endContent holds primary
              actions.
            </Text>
          </LayoutContent>
        }
        header={
          <LayoutHeader
            endContent={<Button label="Save" variant="primary" />}
            startContent={
              <Button
                icon={ChevronLeft}
                isIconOnly
                label="Back"
                variant="ghost"
              />
            }
            subtitle="Edit details"
            title="Profile"
          />
        }
      />
    </Card>
  ),
};

export const HeaderHeight: Story = {
  render: args => (
    <Card style={{height: 420}}>
      <Layout
        {...args}
        content={
          <LayoutContent>
            <Text type="body">Header is pinned to a fixed 96px height.</Text>
          </LayoutContent>
        }
        header={
          <LayoutHeader
            height={96}
            subtitle="Fixed 96px height"
            title="Tall header"
          />
        }
      />
    </Card>
  ),
};
