import type {Meta, StoryObj} from '@storybook/react-vite';
import {CodeBlock} from './CodeBlock';

const longCode = Array.from(
  {length: 24},
  (_, index) =>
    `const item${index + 1} = { id: "${index + 1}", label: "Navigation item ${index + 1}" };`,
).join('\n');

const longSingleLine =
  'const response = await fetch("/api/search?query=component-library-code-block-horizontal-scroll&includeArchived=false&sort=updated_at&direction=desc&limit=100");';

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

export const WithoutCopyButton: Story = {
  args: {
    hasCopyButton: false,
  },
};

export const ScrollableMaxHeight: Story = {
  args: {
    code: longCode,
    hasLineNumbers: true,
    maxHeight: 220,
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
  },
};

export const Empty: Story = {
  args: {
    code: '',
    title: 'empty.txt',
  },
};

export const LongSingleLine: Story = {
  args: {
    code: longSingleLine,
    title: 'request.ts',
  },
};

export const WithoutHeader: Story = {
  args: {
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

export const WidthComparison: Story = {
  render: args => (
    <div style={{display: 'grid', gap: 16}}>
      <CodeBlock {...args} title="fit-content.ts" width="fit-content" />
      <CodeBlock {...args} title="full-width.ts" width="100%" />
    </div>
  ),
};
