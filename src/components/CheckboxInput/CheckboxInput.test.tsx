import {createEvent, fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {CheckboxInput} from 'components/CheckboxInput/CheckboxInput';
import {checkboxInputRecipe} from 'components/CheckboxInput/CheckboxInput.recipe';
import {css} from 'styled-system/css';

describe('CheckboxInput', () => {
  it('calls onChange with checked state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<CheckboxInput label="Accept" onChange={onChange} value={false} />);

    await user.click(screen.getByRole('checkbox', {name: 'Accept'}));
    expect(onChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('supports indeterminate state', () => {
    render(
      <CheckboxInput label="Mixed" onChange={() => {}} value="indeterminate" />,
    );

    expect(screen.getByRole('checkbox', {name: 'Mixed'})).toHaveAttribute(
      'aria-checked',
      'mixed',
    );
  });

  it('keeps the checked glyph nudge off the indeterminate mark', () => {
    // The lucide Check glyph needs a 1px nudge to look centered; the Minus bar
    // is already centered, so inheriting the nudge pushes it below the box's
    // center line.
    const nudge = css({mt: '1px'});
    const {container, rerender} = render(
      <CheckboxInput label="Mixed" onChange={() => {}} value />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the mark is intentionally hidden from the accessibility tree
    expect(container.querySelector('.lucide-check')).toHaveClass(nudge);

    rerender(
      <CheckboxInput label="Mixed" onChange={() => {}} value="indeterminate" />,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the mark is intentionally hidden from the accessibility tree
    expect(container.querySelector('.lucide-minus')).not.toHaveClass(nudge);
  });

  it('fills the box for both the checked and indeterminate marks', () => {
    const filled = css({bg: 'primary'});
    const {container, rerender} = render(
      <CheckboxInput label="Mixed" onChange={() => {}} value />,
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the box is intentionally hidden from the accessibility tree
    const box = (): Element | null => container.querySelector('[aria-hidden]');

    expect(box()).toHaveClass(filled);

    rerender(
      <CheckboxInput label="Mixed" onChange={() => {}} value="indeterminate" />,
    );

    expect(box()).toHaveClass(filled);

    rerender(<CheckboxInput label="Mixed" onChange={() => {}} value={false} />);

    expect(box()).not.toHaveClass(filled);
  });

  it('renders React nodes in the label', () => {
    render(
      <CheckboxInput
        label={
          <>
            Accept the <a href="/terms">terms</a>
          </>
        }
        onChange={() => {}}
        value={false}
      />,
    );

    expect(screen.getByRole('link', {name: 'terms'})).toHaveAttribute(
      'href',
      '/terms',
    );
    expect(
      screen.getByRole('checkbox', {name: 'Accept the terms'}),
    ).toBeInTheDocument();
  });

  it('keeps a disabled label tooltip centered, hoverable, and spaced', () => {
    const {container} = render(
      <CheckboxInput
        isDisabled
        label="Accept"
        labelTooltip="Why this is required"
        onChange={() => {}}
        value={false}
      />,
    );
    const classes = checkboxInputRecipe({isDisabled: true});

    expect(screen.getByText('Accept')).toHaveClass(
      classes.label ?? '',
      css({display: 'inline-flex'}),
      css({alignItems: 'center'}),
    );
    expect(screen.getByRole('tooltip', {hidden: true})).toHaveTextContent(
      'Why this is required',
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the decorative icon is intentionally hidden from the accessibility tree
    const tooltipIcon = container.querySelector('.lucide-info')?.parentElement;
    expect(tooltipIcon).toHaveClass(classes.tooltipIcon ?? '');
    expect(tooltipIcon).toHaveClass(
      css({marginInlineStart: '1'}),
      css({pointerEvents: 'auto'}),
    );
  });

  it('disables the input when isDisabled is true', () => {
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isDisabled
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    expect(screen.getByRole('checkbox', {name: 'Accept'})).toBeDisabled();
  });

  it('does not block changes when isLoading is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isLoading
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {name: 'Accept'});
    expect(checkbox).toBeEnabled();
    expect(checkbox).toHaveAttribute('aria-busy', 'true');

    await user.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(true, expect.any(Object));
  });

  it('blocks changes when isReadOnly is true', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CheckboxInput
        isReadOnly
        label="Accept"
        onChange={onChange}
        value={false}
      />,
    );

    await user.click(screen.getByRole('checkbox', {name: 'Accept'}));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('prevents the native toggle on click when isReadOnly is true', () => {
    render(
      <CheckboxInput
        isReadOnly
        label="Accept"
        onChange={() => {}}
        value={false}
      />,
    );

    const checkbox = screen.getByRole('checkbox', {name: 'Accept'});
    const clickEvent = createEvent.click(checkbox);
    fireEvent(checkbox, clickEvent);

    // Canceling the click is what stops the native toggle (and the resulting
    // visual flash) at the source — an onChange-only guard fires too late to
    // prevent the default action and would leave this false.
    expect(clickEvent.defaultPrevented).toBe(true);
  });

  it('sets aria-invalid and renders error message', () => {
    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        status={{message: 'Required field', type: 'error'}}
        value={false}
      />,
    );

    expect(screen.getByRole('checkbox')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders description with aria-describedby', () => {
    render(
      <CheckboxInput
        description="We will send updates"
        label="Subscribe"
        onChange={() => {}}
        value={false}
      />,
    );

    expect(screen.getByText('We will send updates')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-describedby');
  });

  it('marks the input with the peer class for the focus ring', () => {
    render(<CheckboxInput label="Accept" onChange={() => {}} value={false} />);

    // The box's `_peerFocusVisible` ring targets `.peer:focus-visible ~ &`, so
    // the focus ring renders only while the input carries this marker class.
    expect(screen.getByRole('checkbox', {name: 'Accept'})).toHaveClass('peer');
  });

  it('defaults the checkbox row padding to zero', () => {
    render(<CheckboxInput label="Accept" onChange={() => {}} value={false} />);

    // eslint-disable-next-line testing-library/no-node-access -- verifying the presentational Item wrapper
    const item = screen.getByRole('checkbox', {name: 'Accept'}).closest('div');
    expect(item).toHaveClass('silver-p_0');
  });

  it('applies custom padding to the checkbox row', () => {
    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        padding={2}
        value={false}
      />,
    );

    // The padding belongs to Item's presentational wrapper, which deliberately
    // has no accessible role or consumer-facing test ID.
    // eslint-disable-next-line testing-library/no-node-access
    const item = screen.getByRole('checkbox', {name: 'Accept'}).closest('div');
    expect(item).toHaveClass('silver-p_2');
  });

  it('forwards ref to the input element', () => {
    const ref = vi.fn<(el: HTMLInputElement | null) => void>();

    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        ref={ref}
        value={false}
      />,
    );

    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('fills its container by default', () => {
    render(<CheckboxInput label="Accept" onChange={() => {}} value={false} />);

    // eslint-disable-next-line testing-library/no-node-access
    const item = screen.getByRole('checkbox', {name: 'Accept'}).closest('div');
    expect(item).toHaveStyle({width: '100%'});
  });

  it("still accepts the legacy 'auto' width", () => {
    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        value={false}
        width="auto"
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access
    const item = screen.getByRole('checkbox', {name: 'Accept'}).closest('div');
    expect(item).toHaveStyle({width: 'auto'});
  });

  it('accepts an explicit width', () => {
    render(
      <CheckboxInput
        label="Accept"
        onChange={() => {}}
        value={false}
        width="18rem"
      />,
    );

    // eslint-disable-next-line testing-library/no-node-access
    const item = screen.getByRole('checkbox', {name: 'Accept'}).closest('div');
    expect(item).toHaveStyle({width: '18rem'});
  });
});
