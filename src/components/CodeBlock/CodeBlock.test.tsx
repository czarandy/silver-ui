import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {CodeBlock} from './CodeBlock';

describe('CodeBlock', () => {
  it('renders read-only code in a pre/code block', () => {
    render(<CodeBlock code="const value = 1;" data-testid="code-block" />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByText('const value = 1;')).toBeInTheDocument();
  });

  it('renders a title and language label', () => {
    render(
      <CodeBlock
        code="const value = 1;"
        language="typescript"
        title="Example"
      />,
    );

    expect(screen.getByText('Example - typescript')).toBeInTheDocument();
  });

  it('can hide the language label', () => {
    render(
      <CodeBlock
        code="const value = 1;"
        hasLanguageLabel={false}
        language="typescript"
        title="Example"
      />,
    );

    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(screen.queryByText(/typescript/)).not.toBeInTheDocument();
  });

  it('renders line numbers when requested', () => {
    render(<CodeBlock code={'one\ntwo'} hasLineNumbers />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('marks highlighted lines with data-line attributes', () => {
    render(
      <CodeBlock
        code={'one\ntwo'}
        data-testid="code-block"
        highlightLines={[2]}
      />,
    );

    expect(screen.getByText('two')).toHaveAttribute('data-line', '2');
  });

  it('copies code when the copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    const onCopy = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });

    render(<CodeBlock code="copy me" onCopy={onCopy} />);

    await user.click(screen.getByRole('button', {name: 'Copy code'}));

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();
  });

  it('can hide the copy button', () => {
    render(<CodeBlock code="no copy" hasCopyButton={false} />);

    expect(
      screen.queryByRole('button', {name: 'Copy code'}),
    ).not.toBeInTheDocument();
  });
});
