import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from 'components/Button';
import {
  Lightbox,
  type LightboxMedia,
  type LightboxProps,
} from 'components/Lightbox/Lightbox';
import {useLightbox} from 'components/Lightbox/useLightbox';

type LightboxStoryArgs = Pick<
  LightboxProps,
  'className' | 'defaultIndex' | 'hasAutoPlay' | 'hasZoom' | 'style'
>;

const imageMedia: ReadonlyArray<LightboxMedia> = [
  {
    alt: 'Forest path',
    caption: 'Morning light through a forest path.',
    src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&auto=format&fit=crop',
  },
  {
    alt: 'Mountain lake',
    caption: 'A clear alpine lake below snow-covered mountains.',
    src: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&auto=format&fit=crop',
  },
  {
    alt: 'Desert ridge',
    caption: 'Layered sandstone ridges at sunset.',
    src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1600&auto=format&fit=crop',
  },
];

const videoMedia: LightboxMedia = {
  alt: 'Sample video',
  captionsSrc:
    'https://interactive-examples.mdn.mozilla.net/media/examples/friday.vtt',
  src: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  type: 'video',
};

const mixedMedia: ReadonlyArray<LightboxMedia> = [
  imageMedia[0],
  {
    ...videoMedia,
    caption: 'Short video clip with native controls.',
  },
  imageMedia[1],
];

const meta = {
  title: 'Components/Lightbox',
  args: {
    hasAutoPlay: false,
    hasZoom: false,
  },
  argTypes: {
    hasAutoPlay: {control: 'boolean'},
    hasZoom: {control: 'boolean'},
  },
} satisfies Meta<LightboxStoryArgs>;

export default meta;
type Story = StoryObj<LightboxStoryArgs>;

function LightboxStory({
  defaultIndex,
  media,
  ...args
}: LightboxStoryArgs & {media: LightboxProps['media']}): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open lightbox" onClick={() => setIsOpen(true)} />
      <Lightbox
        {...args}
        defaultIndex={defaultIndex}
        isOpen={isOpen}
        media={media}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

function ControlledIndexStory(args: LightboxStoryArgs): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(1);

  return (
    <>
      <div style={{display: 'flex', gap: 8}}>
        <Button label="Open gallery" onClick={() => setIsOpen(true)} />
        <Button label="Show first" onClick={() => setIndex(0)} />
        <Button
          label="Show last"
          onClick={() => setIndex(imageMedia.length - 1)}
        />
      </div>
      <Lightbox
        {...args}
        index={index}
        isOpen={isOpen}
        media={imageMedia}
        onIndexChange={setIndex}
        onOpenChange={setIsOpen}
      />
    </>
  );
}

function HookStory(): React.JSX.Element {
  const lightbox = useLightbox({media: imageMedia[0]});

  return (
    <>
      <Button label="Open from hook" onClick={() => lightbox.open()} />
      {lightbox.element}
    </>
  );
}

function HookGalleryStory(): React.JSX.Element {
  const lightbox = useLightbox({media: imageMedia, hasZoom: true});

  return (
    <>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(3, minmax(0, 140px))',
        }}>
        {imageMedia.map((item, index) => (
          <div
            key={item.src}
            {...lightbox.getTriggerProps(index)}
            style={{
              border: 0,
              borderRadius: 6,
              cursor: 'pointer',
              overflow: 'hidden',
            }}>
            <img
              alt={item.alt}
              src={item.src}
              style={{
                aspectRatio: '4 / 3',
                display: 'block',
                objectFit: 'cover',
                width: '100%',
              }}
            />
          </div>
        ))}
      </div>
      {lightbox.element}
    </>
  );
}

export const Default: Story = {
  render: args => <LightboxStory {...args} media={imageMedia[0]} />,
};

export const Gallery: Story = {
  render: args => <LightboxStory {...args} media={imageMedia} />,
};

export const Video: Story = {
  render: args => <LightboxStory {...args} media={videoMedia} />,
};

export const MixedMedia: Story = {
  render: args => <LightboxStory {...args} media={mixedMedia} />,
};

export const WithCaptions: Story = {
  render: args => <LightboxStory {...args} media={imageMedia} />,
};

export const ZoomEnabled: Story = {
  args: {
    hasZoom: true,
  },
  render: args => <LightboxStory {...args} media={imageMedia[0]} />,
};

export const AutoplayVideo: Story = {
  args: {
    hasAutoPlay: true,
  },
  render: args => <LightboxStory {...args} media={videoMedia} />,
};

export const ControlledIndex: Story = {
  render: args => <ControlledIndexStory {...args} />,
};

export const UseLightboxHook: Story = {
  render: () => <HookStory />,
};

export const UseLightboxGallery: Story = {
  render: () => <HookGalleryStory />,
};
