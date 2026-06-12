/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Badge} from 'components/Badge';
import {Button} from 'components/Button';
import {Dialog} from 'components/Dialog/Dialog';
import {useDialog} from 'components/Dialog/useDialog';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from 'components/Layout';
import {Text} from 'components/Text';
import {TextInput} from 'components/TextInput';

const meta: Meta<typeof Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  argTypes: {
    dismissBehavior: {control: 'object'},
    maxHeight: {control: 'text'},
    role: {
      control: {type: 'select'},
      options: ['dialog', 'alertdialog'],
    },
    variant: {
      control: {type: 'select'},
      options: ['standard', 'fullscreen'],
    },
    width: {control: 'text'},
  },
  args: {
    dismissBehavior: {
      isBackdropDismissEnabled: true,
      isEscapeDismissEnabled: true,
    },
    maxHeight: '75vh',
    role: 'dialog',
    variant: 'standard',
    width: 420,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open dialog" onClick={() => setIsOpen(true)} />
        <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent>
                <Text as="p" color="secondary">
                  Are you sure you want to apply these changes to this
                  workspace?
                </Text>
              </LayoutContent>
            }
            footer={
              <LayoutFooter
                primaryButton={
                  <Button
                    label="Apply"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                  />
                }
                secondaryButton={
                  <Button label="Cancel" onClick={() => setIsOpen(false)} />
                }
              />
            }
            header={
              <LayoutHeader
                subtitle="Review the updates before applying them."
                title="Confirm changes"
              />
            }
          />
        </Dialog>
      </>
    );
  },
};

export const Required: Story = {
  args: {
    dismissBehavior: false,
    role: 'alertdialog',
  },
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open required dialog" onClick={() => setIsOpen(true)} />
        <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent>
                <Text as="p" color="secondary">
                  This dialog can only be closed from an explicit action.
                </Text>
              </LayoutContent>
            }
            footer={
              <LayoutFooter
                primaryButton={
                  <Button
                    label="Acknowledge"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                  />
                }
              />
            }
            header={<LayoutHeader title="Required action" />}
          />
        </Dialog>
      </>
    );
  },
};

export const Form: Story = {
  args: {
    dismissBehavior: {
      isBackdropDismissEnabled: false,
      isEscapeDismissEnabled: true,
    },
    width: 480,
  },
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open form dialog" onClick={() => setIsOpen(true)} />
        <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                  <TextInput
                    hasAutoFocus
                    label="Name"
                    onChange={() => {}}
                    value="Ada Lovelace"
                  />
                  <TextInput
                    label="Email"
                    onChange={() => {}}
                    type="email"
                    value="ada@example.com"
                  />
                </div>
              </LayoutContent>
            }
            footer={
              <LayoutFooter
                primaryButton={
                  <Button
                    label="Save"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                  />
                }
                secondaryButton={
                  <Button label="Cancel" onClick={() => setIsOpen(false)} />
                }
              />
            }
            header={<LayoutHeader title="Edit profile" />}
          />
        </Dialog>
      </>
    );
  },
};

export const Fullscreen: Story = {
  args: {variant: 'fullscreen'},
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button
          label="Open fullscreen dialog"
          onClick={() => setIsOpen(true)}
        />
        <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent>
                <Text as="p" color="secondary">
                  This dialog takes up the entire viewport.
                </Text>
              </LayoutContent>
            }
            header={<LayoutHeader title="Full screen" />}
          />
        </Dialog>
      </>
    );
  },
};

export const Scrollable: Story = {
  args: {maxHeight: '60vh', width: 520},
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button
          label="Open scrollable dialog"
          onClick={() => setIsOpen(true)}
        />
        <Dialog {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent>
                {Array.from({length: 20}, (_, i) => (
                  <Text as="p" color="secondary" key={i}>
                    Section {i + 1}: Lorem ipsum dolor sit amet, consectetur
                    adipiscing elit. Sed do eiusmod tempor incididunt ut labore
                    et dolore magna aliqua.
                  </Text>
                ))}
              </LayoutContent>
            }
            footer={
              <LayoutFooter
                primaryButton={
                  <Button
                    label="Accept"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                  />
                }
              />
            }
            header={<LayoutHeader title="Terms of Service" />}
          />
        </Dialog>
      </>
    );
  },
};

export const HeaderVariants: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 24}}>
      <div>
        <Text as="p" color="secondary" type="supporting">
          Basic — title only (no close button outside Dialog)
        </Text>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            marginTop: 8,
            maxWidth: 480,
          }}>
          <LayoutHeader title="Basic header" />
        </div>
      </div>
      <div>
        <Text as="p" color="secondary" type="supporting">
          With subtitle and endContent
        </Text>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            marginTop: 8,
            maxWidth: 480,
          }}>
          <LayoutHeader
            endContent={<Badge color="info" label="Draft" size="sm" />}
            subtitle="Supporting text below the title"
            title="Full header"
          />
        </div>
      </div>
      <div>
        <Text as="p" color="secondary" type="supporting">
          With all slots populated
        </Text>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            marginTop: 8,
            maxWidth: 480,
          }}>
          <LayoutHeader
            endContent={<Badge color="info" label="Draft" size="sm" />}
            startContent={<Badge color="success" label="New" size="sm" />}
            subtitle="All slots populated"
            title="Kitchen sink"
          />
        </div>
      </div>
    </div>
  ),
};

export const Imperative: Story = {
  render: () => {
    const dialog = useDialog({width: 480});

    return (
      <>
        <Button
          label="Show report"
          onClick={() =>
            dialog.show(
              <Layout
                content={
                  <LayoutContent>
                    <Text as="p" color="secondary">
                      The report is ready for review.
                    </Text>
                  </LayoutContent>
                }
                header={<LayoutHeader title="Generated report" />}
              />,
            )
          }
        />
        {dialog.element}
      </>
    );
  },
};
