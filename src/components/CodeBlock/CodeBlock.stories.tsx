import type {Meta, StoryObj} from '@storybook/react-vite';
import {CodeBlock} from './CodeBlock';

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  args: {
    code: `type User = {
  id: string;
  name: string;
};

export function formatUser(user: User): string {
  return \`\${user.name} (\${user.id})\`;
}`,
    language: 'typescript',
    title: 'user.ts',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {};

export const WithLineNumbers: Story = {
  args: {
    hasLineNumbers: true,
  },
};

export const HighlightedLines: Story = {
  args: {
    hasLineNumbers: true,
    highlightLines: [5, 6, 7],
  },
};

export const Wrapped: Story = {
  args: {
    code: 'const message = "This is a deliberately long line of code that wraps within the available container width instead of forcing horizontal scrolling.";',
    isWrapped: true,
    width: '100%',
  },
};

export const WithoutHeader: Story = {
  args: {
    hasLanguageLabel: false,
    title: undefined,
  },
};

export const SectionContainer: Story = {
  args: {
    container: 'section',
    hasLineNumbers: true,
    width: '100%',
  },
};
