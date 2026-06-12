import type {Meta, StoryObj} from '@storybook/react-vite';
import {Blockquote} from 'components/Blockquote/Blockquote';

const meta: Meta<typeof Blockquote> = {
  title: 'Components/Blockquote',
  component: Blockquote,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'The best way to predict the future is to invent it.',
  },
};

export const WithCite: Story = {
  args: {
    children: 'The best way to predict the future is to invent it.',
    cite: '— Alan Kay',
  },
};

export const WithReactNodeCite: Story = {
  args: {
    children: 'The best way to predict the future is to invent it.',
    cite: (
      <>
        — Alan Kay,{' '}
        <a href="https://en.wikipedia.org/wiki/Alan_Kay">Wikipedia</a>
      </>
    ),
  },
};

export const WithComplexChildren: Story = {
  args: {
    children: (
      <>
        <p>The best way to predict the future is to invent it.</p>
        <p>
          This is especially true in the field of computing, where the
          boundaries of what is possible are constantly being redefined.
        </p>
      </>
    ),
    cite: '— Alan Kay',
  },
};
