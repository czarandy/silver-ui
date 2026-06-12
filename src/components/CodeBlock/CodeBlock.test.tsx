import {act, fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {CodeBlock} from 'components/CodeBlock/CodeBlock';

describe('CodeBlock', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders read-only code in a pre/code block', () => {
    render(<CodeBlock code="const value = 1;" data-testid="code-block" />);

    expect(screen.getByTestId('code-block')).toBeInTheDocument();
    expect(screen.getByText('const value = 1;')).toBeInTheDocument();
  });

  it('renders a title', () => {
    render(<CodeBlock code="const value = 1;" title="Example" />);

    expect(screen.getByText('Example')).toBeInTheDocument();
    expect(
      screen.getByRole('region', {name: 'Example code block'}),
    ).toBeInTheDocument();
  });

  it('supports an accessible region label override', () => {
    render(<CodeBlock code="const value = 1;" label="Install command" />);

    expect(
      screen.getByRole('region', {name: 'Install command'}),
    ).toBeInTheDocument();
  });

  it('renders line numbers when requested', () => {
    render(<CodeBlock code={'one\ntwo'} hasLineNumbers />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders empty code as an empty code block', () => {
    render(<CodeBlock code="" data-testid="code-block" />);

    expect(screen.getByTestId('code-block-code')).toHaveTextContent('\u200b');
  });

  it('applies maxHeight to the scroll container', () => {
    render(
      <CodeBlock
        code={'one\ntwo\nthree'}
        data-testid="code-block"
        maxHeight={120}
      />,
    );

    expect(screen.getByTestId('code-block-scroll')).toHaveStyle({
      maxHeight: '120px',
    });
  });

  it('makes the scroll container keyboard-focusable and labeled', () => {
    render(<CodeBlock code="const value = 1;" label="Example" />);

    expect(
      screen.getByRole('region', {name: 'Example scroll area'}),
    ).toHaveAttribute('tabIndex', '0');
  });

  it('marks wrapped code content', () => {
    render(
      <CodeBlock code="const value = 1;" data-testid="code-block" isWrapped />,
    );

    expect(screen.getByTestId('code-block-code')).toHaveAttribute(
      'data-wrapped',
    );
  });

  it('marks section container and small size variants', () => {
    render(
      <CodeBlock
        code="const value = 1;"
        container="section"
        data-testid="code-block"
        size="sm"
      />,
    );

    const root = screen.getByTestId('code-block');
    expect(root).toHaveAttribute('data-container', 'section');
    expect(root).toHaveAttribute('data-size', 'sm');
  });

  it('applies width to the root element', () => {
    render(<CodeBlock code="const value = 1;" label="Example" width="100%" />);

    expect(screen.getByRole('region', {name: 'Example'})).toHaveStyle({
      width: '100%',
    });
  });

  it('forwards className, style, and ref to the root element', () => {
    let refNode: HTMLDivElement | null = null;

    render(
      <CodeBlock
        className="custom-code-block"
        code="const value = 1;"
        label="Example"
        ref={node => {
          refNode = node;
        }}
        style={{marginTop: 12}}
      />,
    );

    const root = screen.getByRole('region', {name: 'Example'});
    expect(root).toHaveClass('custom-code-block');
    expect(root).toHaveStyle({marginTop: '12px'});
    expect(refNode).toBe(root);
  });

  it('marks highlighted lines', () => {
    render(
      <CodeBlock
        code={'one\ntwo'}
        data-testid="code-block"
        highlightLines={[2]}
      />,
    );

    expect(screen.getByText('one')).not.toHaveAttribute('data-highlighted');
    expect(screen.getByText('two')).toHaveAttribute('data-highlighted');
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

    const copyButton = screen.getByRole('button', {name: 'Copy code'});
    expect(copyButton).toHaveAttribute('aria-describedby');

    await user.click(copyButton);

    expect(writeText).toHaveBeenCalledWith('copy me');
    expect(onCopy).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();
  });

  it('keeps the copy state unchanged when clipboard writing fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('Denied'));
    const onCopy = vi.fn();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });

    render(<CodeBlock code="copy me" onCopy={onCopy} />);

    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('copy me');
    });
    expect(onCopy).not.toHaveBeenCalled();
    expect(screen.getByRole('button', {name: 'Copy code'})).toBeInTheDocument();
  });

  it('resets copied state after two seconds', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });

    render(<CodeBlock code="copy me" />);

    fireEvent.click(screen.getByRole('button', {name: 'Copy code'}));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByRole('button', {name: 'Copied'})).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByRole('button', {name: 'Copy code'})).toBeInTheDocument();
  });

  it('can hide the copy button', () => {
    render(<CodeBlock code="no copy" hasCopyButton={false} />);

    expect(
      screen.queryByRole('button', {name: 'Copy code'}),
    ).not.toBeInTheDocument();
  });

  it('renders an inline container with the copy button inline', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText},
    });

    render(
      <CodeBlock
        code="npm install silver-ui"
        container="inline"
        data-testid="code-block"
        label="Install silver-ui"
      />,
    );

    const root = screen.getByRole('group', {name: 'Install silver-ui'});
    expect(root).toHaveAttribute('data-container', 'inline');
    expect(screen.getByText('npm install silver-ui')).toBeInTheDocument();

    await user.click(screen.getByRole('button', {name: 'Copy code'}));
    expect(writeText).toHaveBeenCalledWith('npm install silver-ui');
  });

  it('omits the header and region landmark for the inline container', () => {
    render(
      <CodeBlock
        code="npm install silver-ui"
        container="inline"
        label="Install"
        title="ignored.ts"
      />,
    );

    expect(screen.queryByText('ignored.ts')).not.toBeInTheDocument();
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });
});
