import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Collapsible} from 'components/Accordion/Collapsible';
import {Button} from 'components/Button';
import {Card} from 'components/Card';
import {Text} from 'components/Text';

const meta = {
  title: 'Components/Collapsible',
  component: Collapsible,
  argTypes: {
    isDefaultOpen: {control: 'boolean'},
    isDisabled: {control: 'boolean'},
    trigger: {control: 'text'},
  },
  args: {
    trigger: 'Toggle details',
    children: (
      <Text>
        This is the collapsible content. It can contain any elements including
        text, images, forms, or other components.
      </Text>
    ),
  },
} satisfies Meta<typeof Collapsible>;

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible trigger="Toggle details">
        <Text>
          This is the collapsible content. It can contain any elements including
          text, images, forms, or other components.
        </Text>
      </Collapsible>
    </Card>
  ),
};

export const InitiallyClosed: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible isDefaultOpen={false} trigger="Toggle details">
        <Text>This content starts hidden.</Text>
      </Collapsible>
    </Card>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible isDisabled trigger="Disabled section">
        <Text>This content cannot be toggled.</Text>
      </Collapsible>
    </Card>
  ),
};

export const Controlled: Story = {
  render: function Controlled() {
    const [isOpen, setIsOpen] = useState(false);
    return (
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <Button
          label={isOpen ? 'Close externally' : 'Open externally'}
          onClick={() => {
            setIsOpen(prev => !prev);
          }}
          variant="secondary"
        />
        <Card padding={4}>
          <Collapsible
            isOpen={isOpen}
            onOpenChange={setIsOpen}
            trigger="Controlled section">
            <Text>
              This section is controlled by external state. Both the trigger and
              the button above can toggle it.
            </Text>
          </Collapsible>
        </Card>
      </div>
    );
  },
};

export const CustomTrigger: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible
        trigger={
          <span style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <span style={{fontSize: '1.25rem'}}>📋</span>
            <span>Project requirements</span>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '0.125rem 0.5rem',
                borderRadius: '999px',
                backgroundColor: 'var(--silver-colors-bg-subtle)',
              }}>
              3 items
            </span>
          </span>
        }>
        <ul style={{margin: 0, paddingLeft: '1.5rem'}}>
          <li>TypeScript support</li>
          <li>Accessible by default</li>
          <li>Composable API</li>
        </ul>
      </Collapsible>
    </Card>
  ),
};

export const LongContent: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible isDefaultOpen={false} trigger="Terms and conditions">
        <div>
          {Array.from({length: 8}, (_, i) => (
            <Text key={i}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </Text>
          ))}
        </div>
      </Collapsible>
    </Card>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Card padding={4}>
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <Collapsible trigger="Section A">
          <Text>Content for section A.</Text>
        </Collapsible>
        <Collapsible trigger="Section B">
          <Text>Content for section B.</Text>
        </Collapsible>
        <Collapsible isDefaultOpen={false} trigger="Section C (starts closed)">
          <Text>Content for section C.</Text>
        </Collapsible>
      </div>
    </Card>
  ),
};

export const Nested: Story = {
  render: () => (
    <Card padding={4}>
      <Collapsible trigger="Outer section">
        <Text>This section contains a nested collapsible.</Text>
        <Collapsible isDefaultOpen={false} trigger="Inner section">
          <Text>This is the nested content.</Text>
        </Collapsible>
      </Collapsible>
    </Card>
  ),
};

export const Standalone: Story = {
  render: () => (
    <Collapsible trigger="Standalone (no Card wrapper)">
      <Text>This collapsible has no Card wrapper.</Text>
    </Collapsible>
  ),
};
