/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */
import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from '../Button';
import {Layout, LayoutContent, LayoutFooter, LayoutHeader} from '../Layout';
import {Text} from '../Text';
import {TextInput} from '../TextInput';
import {Drawer, type DrawerPlacement} from './Drawer';
import {useDrawer} from './useDrawer';

const meta: Meta<typeof Drawer> = {
  title: 'Components/Drawer',
  component: Drawer,
  argTypes: {
    placement: {
      control: {type: 'select'},
      options: ['start', 'end', 'top', 'bottom'],
    },
    size: {control: 'text'},
  },
  args: {
    isOpen: false,
    label: 'Drawer',
    placement: 'end',
    size: 360,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function DrawerContent({
  onClose,
  title = 'Project details',
}: {
  onClose: () => void;
  title?: string;
}): React.JSX.Element {
  return (
    <Layout
      content={
        <LayoutContent>
          <Text as="p" color="secondary">
            Review project activity, ownership, and open follow-ups.
          </Text>
        </LayoutContent>
      }
      footer={
        <LayoutFooter
          primaryButton={
            <Button label="Done" onClick={onClose} variant="primary" />
          }
          secondaryButton={<Button label="Cancel" onClick={onClose} />}
        />
      }
      header={<LayoutHeader title={title} />}
    />
  );
}

export const Default: Story = {
  args: {label: 'Project details', placement: 'end', size: 360},
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open drawer" onClick={() => setIsOpen(true)} />
        <Drawer {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <DrawerContent onClose={() => setIsOpen(false)} />
        </Drawer>
      </>
    );
  },
};

const placements: {
  label: string;
  placement: DrawerPlacement;
}[] = [
  {label: 'Left', placement: 'start'},
  {label: 'Right', placement: 'end'},
  {label: 'Top', placement: 'top'},
  {label: 'Bottom', placement: 'bottom'},
];

export const PlacementVariants: Story = {
  render: () => {
    const [placement, setPlacement] = useState<DrawerPlacement | null>(null);
    const activePlacement = placement ?? 'end';

    return (
      <>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
          {placements.map(option => (
            <Button
              key={option.placement}
              label={option.label}
              onClick={() => setPlacement(option.placement)}
            />
          ))}
        </div>
        <Drawer
          isOpen={placement != null}
          label={`${placements.find(option => option.placement === placement)?.label ?? 'Right'} drawer`}
          onOpenChange={nextOpen => {
            if (!nextOpen) {
              setPlacement(null);
            }
          }}
          placement={activePlacement}>
          <DrawerContent
            onClose={() => setPlacement(null)}
            title={`${placements.find(option => option.placement === activePlacement)?.label ?? 'Right'} drawer`}
          />
        </Drawer>
      </>
    );
  },
};

export const CustomSize: Story = {
  render: () => {
    const [variant, setVariant] = useState<'numeric' | 'string' | null>(null);

    return (
      <>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
          <Button
            label="Open 480px drawer"
            onClick={() => setVariant('numeric')}
          />
          <Button
            label="Open 60vw drawer"
            onClick={() => setVariant('string')}
          />
        </div>
        <Drawer
          isOpen={variant != null}
          label="Custom size drawer"
          onOpenChange={nextOpen => {
            if (!nextOpen) {
              setVariant(null);
            }
          }}
          placement="end"
          size={variant === 'string' ? '60vw' : 480}>
          <DrawerContent
            onClose={() => setVariant(null)}
            title={variant === 'string' ? '60vw drawer' : '480px drawer'}
          />
        </Drawer>
      </>
    );
  },
};

export const Imperative: Story = {
  render: () => {
    const drawer = useDrawer({label: 'Generated report', size: 420});

    return (
      <>
        <Button
          label="Show report"
          onClick={() =>
            drawer.show(
              <Layout
                content={
                  <LayoutContent>
                    <Text as="p" color="secondary">
                      The report is ready for review.
                    </Text>
                  </LayoutContent>
                }
                footer={
                  <LayoutFooter
                    primaryButton={
                      <Button
                        label="Close"
                        onClick={drawer.hide}
                        variant="primary"
                      />
                    }
                  />
                }
                header={<LayoutHeader title="Generated report" />}
              />,
            )
          }
        />
        {drawer.element}
      </>
    );
  },
};

export const AutoFocus: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open drawer" onClick={() => setIsOpen(true)} />
        <Drawer
          isOpen={isOpen}
          label="Auto focus drawer"
          onOpenChange={setIsOpen}
          size={400}>
          <Layout
            content={
              <LayoutContent>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                  }}>
                  <button
                    data-autofocus="true"
                    style={{alignSelf: 'flex-start'}}
                    type="button">
                    Focused action
                  </button>
                  <TextInput
                    label="Notes"
                    onChange={() => {}}
                    placeholder="Add notes"
                    value=""
                  />
                </div>
              </LayoutContent>
            }
            footer={
              <LayoutFooter
                primaryButton={
                  <Button
                    label="Close"
                    onClick={() => setIsOpen(false)}
                    variant="primary"
                  />
                }
              />
            }
            header={<LayoutHeader title="Auto focus" />}
          />
        </Drawer>
      </>
    );
  },
};

export const NestedContent: Story = {
  args: {label: 'Edit workspace', placement: 'end', size: 440},
  render: args => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Edit workspace" onClick={() => setIsOpen(true)} />
        <Drawer {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
          <Layout
            content={
              <LayoutContent label="Workspace settings">
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 16,
                  }}>
                  <TextInput
                    label="Workspace name"
                    onChange={() => {}}
                    value="Research Operations"
                  />
                  <TextInput
                    label="Owner"
                    onChange={() => {}}
                    value="Ada Lovelace"
                  />
                  {Array.from({length: 10}, (_, index) => (
                    <Text as="p" color="secondary" key={index}>
                      Setting group {index + 1}: Configure access,
                      notifications, and workflow defaults for this workspace.
                    </Text>
                  ))}
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
            header={
              <LayoutHeader
                subtitle="Manage workspace metadata and defaults."
                title="Edit workspace"
              />
            }
          />
        </Drawer>
      </>
    );
  },
};
