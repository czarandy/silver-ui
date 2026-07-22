import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {StatusMessage} from 'internal/StatusMessage';
import {statusMessageRecipe} from 'internal/StatusMessage.recipe';

describe('StatusMessage', () => {
  it('renders nothing without a status', () => {
    const {container} = render(<StatusMessage />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when the status has no message', () => {
    const {container} = render(<StatusMessage status={{type: 'error'}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('uses assertive alert semantics for errors', () => {
    render(
      <StatusMessage
        id="status-id"
        status={{message: 'Fix this field.', type: 'error'}}
      />,
    );

    const message = screen.getByRole('alert');
    expect(message).toHaveTextContent('Fix this field.');
    expect(message).toHaveAttribute('aria-live', 'assertive');
    expect(message).toHaveAttribute('id', 'status-id');
  });

  it.each(['warning', 'success'] as const)(
    'uses polite status semantics for %s messages',
    type => {
      render(<StatusMessage status={{message: 'All good.', type}} />);

      const message = screen.getByRole('status');
      expect(message).toHaveAttribute('aria-live', 'polite');
      expect(message).toHaveClass(statusMessageRecipe({statusType: type}));
    },
  );

  it.each(['attached', 'detached'] as const)(
    'applies the %s variant classes',
    variant => {
      render(
        <StatusMessage
          status={{message: 'Fix this field.', type: 'error'}}
          variant={variant}
        />,
      );

      expect(screen.getByRole('alert')).toHaveClass(
        statusMessageRecipe({statusType: 'error', variant}),
      );
    },
  );
});
