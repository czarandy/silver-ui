import type {Meta, StoryObj} from '@storybook/react-vite';
import {AspectRatio} from 'components/AspectRatio';
import {Image} from 'components/Image/Image';

const landscapeSource =
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop';

const meta: Meta<typeof Image> = {
  title: 'Components/Image',
  component: Image,
  args: {
    alt: 'Mountain landscape at sunset',
    height: 800,
    src: landscapeSource,
    style: {maxWidth: 720},
    width: 1200,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResponsiveSources: Story = {
  args: {
    sizes: '(max-width: 640px) 100vw, 720px',
    srcSet:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=480&auto=format&fit=crop 480w, https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=960&auto=format&fit=crop 960w, https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1440&auto=format&fit=crop 1440w',
  },
};

export const ObjectFit: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        maxWidth: 720,
      }}>
      <div>
        <p>cover</p>
        <AspectRatio ratio={1}>
          <Image alt="Landscape cropped to cover" src={landscapeSource} />
        </AspectRatio>
      </div>
      <div>
        <p>contain</p>
        <AspectRatio ratio={1}>
          <Image
            alt="Full landscape contained in frame"
            objectFit="contain"
            src={landscapeSource}
          />
        </AspectRatio>
      </div>
    </div>
  ),
};

export const CustomFallback: Story = {
  args: {
    alt: 'Unavailable product photo',
    fallback: <span>Product image unavailable</span>,
    height: 400,
    src: '/missing-image.jpg',
    style: {height: 240, width: 360},
    width: 600,
  },
};

export const WithAspectRatio: Story = {
  render: () => (
    <div style={{maxWidth: 960}}>
      <AspectRatio ratio={16 / 9}>
        <Image
          alt="Mountain landscape hero"
          fetchPriority="high"
          loading="eager"
          src={landscapeSource}
        />
      </AspectRatio>
    </div>
  ),
};
