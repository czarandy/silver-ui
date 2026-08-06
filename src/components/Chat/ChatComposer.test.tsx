import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {ChatComposer} from 'components/Chat/ChatComposer';
import {ChatComposerInput} from 'components/Chat/ChatComposerInput';
import {computeInputHeight} from 'components/Chat/ChatComposerInput.utils';
import {ChatSendButton} from 'components/Chat/ChatSendButton';

describe('ChatComposer', () => {
  it('submits the trimmed value and clears the input', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Type a message…');
    await user.type(input, '  Hello there  ');
    await user.click(screen.getByRole('button', {name: 'Send'}));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('Hello there');
    expect(input).toHaveValue('');
  });

  it('disables send while the input is empty or whitespace', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer onSubmit={onSubmit} />);

    const sendButton = screen.getByRole('button', {name: 'Send'});
    expect(sendButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('Type a message…'), '   ');
    expect(sendButton).toBeDisabled();
  });

  it('submits on Enter but not Shift+Enter', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposer onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText('Type a message…');
    await user.type(input, 'line one');
    await user.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSubmit).not.toHaveBeenCalled();

    await user.type(input, 'line two');
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('line one\nline two');
  });

  it('does not submit while composing text (IME)', () => {
    const onSubmit = vi.fn();
    render(<ChatComposer onSubmit={onSubmit} value="こんにちは" />);

    const input = screen.getByPlaceholderText('Type a message…');
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        isComposing: true,
        key: 'Enter',
      }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('supports controlled value without self-clearing', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onChange = vi.fn();

    function Controlled() {
      const [value, setValue] = useState('draft');
      return (
        <ChatComposer
          onChange={next => {
            onChange(next);
            setValue(next);
          }}
          onSubmit={onSubmit}
          value={value}
        />
      );
    }
    render(<Controlled />);

    const input = screen.getByPlaceholderText('Type a message…');
    expect(input).toHaveValue('draft');

    await user.type(input, '!');
    expect(onChange).toHaveBeenCalledWith('draft!');

    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith('draft!');
    // After submit the composer requests a clear via onChange('').
    expect(onChange).toHaveBeenLastCalledWith('');
    expect(input).toHaveValue('');
  });

  it('shows an enabled stop button while stopped is shown', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(<ChatComposer isStopShown onStop={onStop} onSubmit={vi.fn()} />);

    const stopButton = screen.getByRole('button', {name: 'Stop'});
    expect(stopButton).toBeEnabled();

    await user.click(stopButton);
    expect(onStop).toHaveBeenCalledOnce();
  });

  it('keeps the stop button clickable while disabled', async () => {
    const user = userEvent.setup();
    const onStop = vi.fn();
    render(
      <ChatComposer
        isDisabled
        isStopShown
        onStop={onStop}
        onSubmit={vi.fn()}
      />,
    );

    const stopButton = screen.getByRole('button', {name: 'Stop'});
    expect(stopButton).toBeEnabled();
    await user.click(stopButton);

    expect(onStop).toHaveBeenCalledOnce();
  });

  it('ignores submit while disabled', () => {
    const onSubmit = vi.fn();
    render(<ChatComposer isDisabled onSubmit={onSubmit} value="hello" />);

    const input = screen.getByPlaceholderText('Type a message…');
    expect(input).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Send'})).toBeDisabled();
  });

  it('renders an error status as an alert', () => {
    render(
      <ChatComposer
        onSubmit={vi.fn()}
        status={{message: 'Message failed to send', type: 'error'}}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Message failed to send',
    );
  });

  it('renders a warning status as a status', () => {
    render(
      <ChatComposer
        onSubmit={vi.fn()}
        status={{message: 'Context almost full', type: 'warning'}}
      />,
    );

    // Button renders its own visually-hidden status region, so anchor the
    // query on the message text.
    const statusBar = screen.getByText('Context almost full');
    expect(statusBar).toHaveAttribute('role', 'status');
  });

  it('focuses the input when clicking non-interactive composer content', async () => {
    const user = userEvent.setup();
    render(
      <ChatComposer
        headerContext={<span>32k tokens left</span>}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByText('32k tokens left'));

    expect(screen.getByPlaceholderText('Type a message…')).toHaveFocus();
  });

  it('renders custom slots', () => {
    render(
      <ChatComposer
        footerActions={<span data-testid="footer-actions" />}
        headerActions={<span data-testid="header-actions" />}
        headerContext={<span data-testid="header-context" />}
        onSubmit={vi.fn()}
        sendActions={<span data-testid="send-actions" />}
      />,
    );

    expect(screen.getByTestId('header-actions')).toBeInTheDocument();
    expect(screen.getByTestId('header-context')).toBeInTheDocument();
    expect(screen.getByTestId('footer-actions')).toBeInTheDocument();
    expect(screen.getByTestId('send-actions')).toBeInTheDocument();
  });

  it('replaces the default input and send button', () => {
    render(
      <ChatComposer
        input={<textarea data-testid="custom-input" />}
        onSubmit={vi.fn()}
        sendButton={<button data-testid="custom-send" type="button" />}
      />,
    );

    expect(screen.getByTestId('custom-input')).toBeInTheDocument();
    expect(screen.getByTestId('custom-send')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Send'}),
    ).not.toBeInTheDocument();
  });

  it('applies className, style, and ref to the root', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <ChatComposer
        className="custom-composer"
        data-testid="composer"
        onSubmit={vi.fn()}
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const composer = screen.getByTestId('composer');
    expect(composer).toHaveClass('custom-composer');
    expect(composer).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('forwards the curated passthrough props to the root', () => {
    render(
      <>
        <span id="composer-label">Message</span>
        <ChatComposer
          aria-labelledby="composer-label"
          data-testid="composer"
          id="composer"
          onSubmit={vi.fn()}
        />
      </>,
    );

    const composer = screen.getByTestId('composer');
    expect(composer).toHaveAttribute('id', 'composer');
    expect(composer).toHaveAttribute('aria-labelledby', 'composer-label');
  });
});

describe('ChatComposerInput', () => {
  it('works standalone with its own state', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChatComposerInput data-testid="input" onSubmit={onSubmit} />);

    const input = screen.getByTestId('input');
    await user.type(input, 'standalone');
    expect(input).toHaveValue('standalone');

    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('respects a consumer onKeyDown that prevents default', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <ChatComposerInput
        data-testid="input"
        onKeyDown={event => {
          if (event.key === 'Enter') {
            event.preventDefault();
          }
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.type(screen.getByTestId('input'), 'hi');
    await user.keyboard('{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('forwards the curated textarea props', async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    const onFocus = vi.fn();
    render(
      <>
        <span id="input-hint">Enter sends</span>
        <ChatComposerInput
          aria-describedby="input-hint"
          data-testid="input"
          enterKeyHint="send"
          id="composer-input"
          maxLength={100}
          name="message"
          onBlur={onBlur}
          onFocus={onFocus}
        />
        <button type="button">Elsewhere</button>
      </>,
    );

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('id', 'composer-input');
    expect(input).toHaveAttribute('name', 'message');
    expect(input).toHaveAttribute('aria-describedby', 'input-hint');
    expect(input).toHaveAttribute('enterkeyhint', 'send');
    expect(input).toHaveAttribute('maxlength', '100');

    await user.click(input);
    expect(onFocus).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button', {name: 'Elsewhere'}));
    expect(onBlur).toHaveBeenCalledOnce();
  });

  it('forwards onPaste so consumers can intercept pasted content', async () => {
    const user = userEvent.setup();
    const onPaste = vi.fn();
    render(<ChatComposerInput data-testid="input" onPaste={onPaste} />);

    await user.click(screen.getByTestId('input'));
    await user.paste('pasted text');

    expect(onPaste).toHaveBeenCalledOnce();
  });
});

describe('computeInputHeight', () => {
  it('clamps to the minimum row height', () => {
    expect(computeInputHeight(0, 24, 2, 8)).toBe(48);
  });

  it('uses the content height between the bounds', () => {
    expect(computeInputHeight(100, 24, 1, 8)).toBe(100);
  });

  it('clamps to the maximum row height', () => {
    expect(computeInputHeight(500, 24, 1, 8)).toBe(192);
  });
});

describe('ChatSendButton', () => {
  it('renders standalone with prop overrides', async () => {
    const user = userEvent.setup();
    const onSend = vi.fn();
    render(<ChatSendButton isDisabled={false} onSend={onSend} />);

    const button = screen.getByRole('button', {name: 'Send'});
    expect(button).toBeEnabled();

    await user.click(button);
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('prefers prop overrides over composer context', async () => {
    const user = userEvent.setup();
    const contextSubmit = vi.fn();
    const onSend = vi.fn();
    render(
      <ChatComposer
        onSubmit={contextSubmit}
        sendButton={<ChatSendButton isDisabled={false} onSend={onSend} />}
        value="hello"
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Send'}));

    expect(onSend).toHaveBeenCalledOnce();
    expect(contextSubmit).not.toHaveBeenCalled();
  });

  it('forwards the shared button passthrough props', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onKeyDown = vi.fn();
    render(
      <>
        <span id="send-hint">Press to send</span>
        <ChatSendButton
          aria-describedby="send-hint"
          aria-keyshortcuts="Meta+Enter"
          form="composer-form"
          id="send"
          isDisabled={false}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
      </>,
    );

    const button = screen.getByRole('button', {name: 'Send'});
    expect(button).toHaveAttribute('id', 'send');
    // The icon-only tooltip appends its own id, so the consumer's survives
    // alongside it rather than replacing it.
    expect(button).toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('send-hint'),
    );
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Meta+Enter');
    expect(button).toHaveAttribute('form', 'composer-form');

    await user.click(button);
    expect(onFocus).toHaveBeenCalledOnce();

    await user.keyboard('a');
    expect(onKeyDown).toHaveBeenCalledOnce();
  });
});
