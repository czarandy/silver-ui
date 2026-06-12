import type {Meta, StoryObj} from '@storybook/react-vite';
import {AspectRatio} from 'components/AspectRatio/AspectRatio';

const meta: Meta<typeof AspectRatio> = {
  title: 'Components/AspectRatio',
  component: AspectRatio,
  args: {
    ratio: 16 / 9,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Widescreen: Story = {
  render: args => (
    <AspectRatio {...args}>
      <img
        alt="Landscape"
        src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop"
        style={{height: '100%', objectFit: 'cover', width: '100%'}}
      />
    </AspectRatio>
  ),
};

export const Ratios: Story = {
  render: () => (
    <div
      style={{display: 'grid', gap: 16, gridTemplateColumns: 'repeat(3, 1fr)'}}>
      {[1, 4 / 3, 16 / 9].map(ratio => (
        <AspectRatio key={ratio} ratio={ratio}>
          <div
            style={{
              alignItems: 'center',
              background: '#eef2f5',
              display: 'flex',
              height: '100%',
              justifyContent: 'center',
              width: '100%',
            }}>
            {ratio === 1 ? '1:1' : ratio === 4 / 3 ? '4:3' : '16:9'}
          </div>
        </AspectRatio>
      ))}
    </div>
  ),
};
