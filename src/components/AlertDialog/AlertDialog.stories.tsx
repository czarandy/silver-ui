/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */

import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from '../Button';
import {AlertDialog} from './AlertDialog';
import {useAlertDialog} from './useAlertDialog';

const meta: Meta<typeof AlertDialog> = {
  title: 'Components/AlertDialog',
  component: AlertDialog,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Delete item" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Delete"
          description="This action cannot be undone."
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Delete item?"
        />
      </>
    );
  },
};

export const LoadingAction: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Delete item" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Delete"
          description="This action cannot be undone."
          isActionLoading
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Delete item?"
        />
      </>
    );
  },
};

export const CustomCancelLabel: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Delete item" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Delete"
          cancelLabel="No, keep it"
          description="This action cannot be undone."
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Delete item?"
        />
      </>
    );
  },
};

export const PrimaryAction: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Archive project" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Archive"
          actionVariant="primary"
          description="Archived projects can be restored later."
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Archive project?"
        />
      </>
    );
  },
};

export const CustomWidth: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Open wide dialog" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Confirm"
          description="This dialog uses a custom width of 600px."
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Wide dialog"
          width={600}
        />
      </>
    );
  },
};

export const LongContent: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <Button label="Delete project" onClick={() => setIsOpen(true)} />
        <AlertDialog
          actionLabel="Delete"
          description="This action will permanently delete all associated data, including files, comments, activity history, and any linked resources. Once deleted, this information cannot be recovered. Please make sure you have backed up anything you need before proceeding."
          isOpen={isOpen}
          onAction={() => setIsOpen(false)}
          onOpenChange={setIsOpen}
          title="Are you sure you want to permanently delete this project and all of its contents?"
        />
      </>
    );
  },
};

export const Imperative: Story = {
  render: () => {
    const alert = useAlertDialog();

    return (
      <>
        <Button
          label="Open imperative alert"
          onClick={() =>
            alert.show({
              actionLabel: 'Archive',
              actionVariant: 'primary',
              description: 'Archived projects can be restored later.',
              onAction: alert.hide,
              title: 'Archive project?',
            })
          }
        />
        {alert.element}
      </>
    );
  },
};
