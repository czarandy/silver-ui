import type {Meta, StoryObj} from '@storybook/react-vite';
import {Highlight} from 'components/Highlight/Highlight';

const meta = {
  title: 'Components/Highlight',
  component: Highlight,
  args: {
    children: 'Search results explain why each result matched.',
    query: 'result',
  },
} satisfies Meta<typeof Highlight>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MultipleQueries: Story = {
  args: {
    children: 'Highlight several matching terms in the same sentence.',
    query: ['highlight', 'matching', 'sentence'],
  },
};
