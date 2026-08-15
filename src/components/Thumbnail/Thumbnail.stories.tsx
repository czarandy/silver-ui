import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';
import {HStack} from 'components/Stack';
import {Thumbnail} from 'components/Thumbnail/Thumbnail';

const meta: Meta<typeof Thumbnail> = {
  title: 'Components/Thumbnail',
  component: Thumbnail,
  args: {
    alt: 'Preview',
    label: 'photo.jpg',
    src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&h=160&fit=crop',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function solidImage(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${color}" /></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const Default: Story = {};

export const Interactive: Story = {
  args: {
    label: 'Open photo.jpg',
    onClick: fn(),
  },
};

export const Removable: Story = {
  args: {
    label: 'Remove photo.jpg',
    onRemove: fn(),
  },
};

export const RemoveContrast: Story = {
  args: {
    onRemove: fn(),
  },
  render: args => (
    <HStack gap={3}>
      <Thumbnail
        {...args}
        alt="Light test image"
        label="light-image.jpg"
        src={solidImage('#ffffff')}
      />
      <Thumbnail
        {...args}
        alt="Dark test image"
        label="dark-image.jpg"
        src={solidImage('#22272d')}
      />
    </HStack>
  ),
};

export const Disabled: Story = {
  args: {
    isDisabled: true,
    onClick: fn(),
    onRemove: fn(),
  },
};

export const LoadingWithImage: Story = {
  args: {
    isLoading: true,
    label: 'Uploading photo.jpg',
  },
};

export const ImageError: Story = {
  args: {
    alt: 'Broken preview',
    label: 'Broken image',
    src: '/missing-thumbnail-image.jpg',
  },
};

export const InteractiveRemovable: Story = {
  args: {
    label: 'Open or remove photo.jpg',
    onClick: fn(),
    onRemove: fn(),
  },
};

export const States: Story = {
  render: () => (
    <HStack gap={3}>
      <Thumbnail
        alt="Preview"
        label="photo.jpg"
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=160&h=160&fit=crop"
      />
      <Thumbnail isLoading label="Uploading" />
      <Thumbnail label="Missing image" />
    </HStack>
  ),
};
