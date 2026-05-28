import type {Meta, StoryObj} from '@storybook/react-vite';
import {HStack} from '../Stack';
import {Thumbnail} from './Thumbnail';

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

export const Default: Story = {};
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
