import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {FileInput, type FileInputProps} from './FileInput';

function SingleFileStory(): React.JSX.Element {
  const [value, setValue] = useState<File | null>(null);
  return <FileInput label="Upload" onChange={setValue} value={value} />;
}

function DropzoneStory(): React.JSX.Element {
  const [value, setValue] = useState<File[]>([]);
  return (
    <FileInput
      isMultiple
      label="Upload"
      mode="dropzone"
      onChange={setValue}
      value={value}
    />
  );
}

function WithDescriptionStory(): React.JSX.Element {
  const [value, setValue] = useState<File | null>(null);
  return (
    <FileInput
      description="PDF, PNG, or JPG up to 10 MB"
      label="Upload"
      onChange={setValue}
      value={value}
    />
  );
}

function AcceptImagesStory(): React.JSX.Element {
  const [value, setValue] = useState<File | null>(null);
  return (
    <FileInput
      accept="image/png, image/jpeg"
      description="PNG or JPG only"
      label="Upload"
      onChange={setValue}
      value={value}
    />
  );
}

function RequiredStory(): React.JSX.Element {
  const [value, setValue] = useState<File | null>(null);
  return (
    <FileInput isRequired label="Upload" onChange={setValue} value={value} />
  );
}

const meta = {
  title: 'Components/FileInput',
  component: FileInput,
  args: {label: 'Upload'},
} satisfies Meta<FileInputProps>;

export default meta;
type Story = StoryObj<FileInputProps>;

export const Default: Story = {
  render: (): React.JSX.Element => <SingleFileStory />,
};

export const Dropzone: Story = {
  render: (): React.JSX.Element => <DropzoneStory />,
};

export const WithDescription: Story = {
  render: (): React.JSX.Element => <WithDescriptionStory />,
};

export const AcceptImages: Story = {
  render: (): React.JSX.Element => <AcceptImagesStory />,
};

export const Disabled: Story = {
  render: (): React.JSX.Element => (
    <FileInput isDisabled label="Upload" onChange={() => {}} value={null} />
  ),
};

export const Loading: Story = {
  render: (): React.JSX.Element => (
    <FileInput isLoading label="Upload" onChange={() => {}} value={null} />
  ),
};

export const Required: Story = {
  render: (): React.JSX.Element => <RequiredStory />,
};

export const Error: Story = {
  render: (): React.JSX.Element => (
    <FileInput
      label="Upload"
      onChange={() => {}}
      status={{message: 'A file is required.', type: 'error'}}
      value={null}
    />
  ),
};

export const Small: Story = {
  render: (): React.JSX.Element => (
    <FileInput label="Upload" onChange={() => {}} size="sm" value={null} />
  ),
};

export const Large: Story = {
  render: (): React.JSX.Element => (
    <FileInput label="Upload" onChange={() => {}} size="lg" value={null} />
  ),
};

export const DropzoneDisabled: Story = {
  render: (): React.JSX.Element => (
    <FileInput
      isDisabled
      isMultiple
      label="Upload"
      mode="dropzone"
      onChange={() => {}}
      value={[]}
    />
  ),
};
