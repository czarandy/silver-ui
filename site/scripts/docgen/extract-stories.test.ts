import ts from 'typescript';
import {describe, expect, it} from 'vitest';
import {
  extractStoriesFile,
  extractStoriesSource,
  storyFilesOf,
} from './extract-stories';
import {synthesizeJsx} from './synthesize-jsx';

const publicComponentNames = new Set([
  'Button',
  'Icon',
  'SegmentedControl',
  'SegmentedControlItem',
  'Switch',
  'TextInput',
]);

function argsMap(objectLiteral: string): Map<string, ts.Expression> {
  const source = ts.createSourceFile(
    'args.tsx',
    `const args = ${objectLiteral};`,
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  const statement = source.statements[0] as ts.VariableStatement;
  const initializer = statement.declarationList.declarations[0]
    .initializer as ts.ObjectLiteralExpression;
  const map = new Map<string, ts.Expression>();
  for (const property of initializer.properties) {
    if (ts.isPropertyAssignment(property) && ts.isIdentifier(property.name)) {
      map.set(property.name.text, property.initializer);
    }
  }
  return map;
}

describe('synthesizeJsx', () => {
  it('renders literals as attributes and identifiers in braces', () => {
    expect(
      synthesizeJsx(
        'Button',
        argsMap("{label: 'Save', icon: Plus, isDisabled: true, count: 3}"),
      ),
    ).toBe('<Button label="Save" icon={Plus} isDisabled count={3} />');
  });

  it('renders children as element content', () => {
    expect(
      synthesizeJsx('Text', argsMap("{children: 'Hello world', type: 'body'}")),
    ).toBe('<Text type="body">Hello world</Text>');
  });

  it('wraps long snippets to one attribute per line', () => {
    const snippet = synthesizeJsx(
      'Alert',
      argsMap(
        "{title: 'Theme preview', description: 'A very long description that will not fit on one single line at all', status: 'info'}",
      ),
    );
    expect(snippet).toBe(
      [
        '<Alert',
        '  title="Theme preview"',
        '  description="A very long description that will not fit on one single line at all"',
        '  status="info"',
        '/>',
      ].join('\n'),
    );
  });
});

describe('extractStoriesFile', () => {
  const button = extractStoriesFile('Button', 'Button', publicComponentNames);

  it('synthesizes args-only stories from merged meta and story args', () => {
    const primary = button.stories.find(s => s.exportName === 'Primary');
    expect(primary?.snippet).toBe(
      '<Button label="Button" variant="primary" />',
    );
  });

  it('extracts the returned JSX of render stories', () => {
    const sizes = button.stories.find(s => s.exportName === 'Sizes');
    expect(sizes?.snippet).toContain('<Button label="Small" size="sm" />');
    expect(sizes?.snippet).not.toContain('render:');
    // The snippet is dedented to top level.
    expect(sizes?.snippet.split('\n')[1]).toMatch(/^ {2}</);
  });

  it('start-cases export names into display names', () => {
    const iconOnly = button.stories.find(
      s => s.exportName === 'IconOnlyLoading',
    );
    expect(iconOnly?.displayName).toBe('Icon Only Loading');
  });

  it('extracts every exported Story const', () => {
    expect(button.stories.length).toBeGreaterThanOrEqual(15);
  });

  it('expands local story wrappers so the snippet renders the library component', () => {
    const stories = extractStoriesFile(
      'Switch',
      'Switch',
      publicComponentNames,
    );
    const defaultStory = stories.stories.find(
      story => story.exportName === 'Default',
    );
    expect(defaultStory?.snippet).toContain('function SwitchStory');
    expect(defaultStory?.snippet).toContain('<Switch');
    expect(defaultStory?.snippet).toContain('<SwitchStory {...args} />');
  });

  it('rejects snippets without a public library component or hook', () => {
    const source = `
      type Story = unknown;
      function WrappedStory() {
        return <div>Only a wrapper</div>;
      }
      export const Default: Story = {
        render: () => <WrappedStory />,
      };
    `;
    expect(() =>
      extractStoriesSource(
        'Example',
        'Example',
        'Example.stories.tsx',
        source,
        new Set(['Example']),
      ),
    ).toThrow(
      'docgen: Example/Example#Default: code snippet does not explicitly use a silver-ui component or hook',
    );
  });

  it('rejects args-only stories whose meta component is a local wrapper', () => {
    const source = `
      type Story = unknown;
      function WrappedStory() {
        return <Example />;
      }
      const meta = {component: WrappedStory};
      export const Default: Story = {};
    `;
    expect(() =>
      extractStoriesSource(
        'Example',
        'Example',
        'Example.stories.tsx',
        source,
        new Set(['Example']),
      ),
    ).toThrow(
      'docgen: Example/Example#Default: code snippet does not explicitly use a silver-ui component or hook',
    );
  });

  it('expands wrappers that demonstrate a public library hook', () => {
    const source = `
      import {useExample} from 'components/Example/useExample';
      type Story = unknown;
      function HookStory() {
        const example = useExample();
        return example.element;
      }
      export const WithHook: Story = {
        render: () => <HookStory />,
      };
    `;
    const stories = extractStoriesSource(
      'Example',
      'Example',
      'Example.stories.tsx',
      source,
      new Set(['Example']),
    );
    expect(stories.stories[0]?.snippet).toContain(
      'const example = useExample()',
    );
    expect(stories.stories[0]?.snippet).toContain('<HookStory />');
  });

  it('keeps setup statements in block-bodied render functions', () => {
    const source = `
      import {useExample} from 'components/Example/useExample';
      type Story = unknown;
      export const WithHook: Story = {
        render: () => {
          const example = useExample();
          return example.element;
        },
      };
    `;
    const stories = extractStoriesSource(
      'Example',
      'Example',
      'Example.stories.tsx',
      source,
      new Set(['Example']),
    );
    expect(stories.stories[0]?.snippet).toContain(
      'const example = useExample()',
    );
    expect(stories.stories[0]?.snippet).toContain('return example.element');
  });
});

describe('storyFilesOf', () => {
  it('lists all stories files with the directory-named file first', () => {
    expect(storyFilesOf('Accordion')).toEqual(['Accordion', 'Collapsible']);
    expect(storyFilesOf('Button')).toEqual(['Button']);
  });
});
