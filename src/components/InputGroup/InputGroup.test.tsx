import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {inputRecipe} from 'components/Field/inputStyles';
import {InputGroup} from 'components/InputGroup/InputGroup';
import {InputGroupText} from 'components/InputGroup/InputGroupText';
import {NumberInput} from 'components/NumberInput';
import {TextInput} from 'components/TextInput';
import {statusMessageRecipe} from 'internal/StatusMessage.recipe';

describe('InputGroup', () => {
  it('renders a labeled group with addon text and an input', () => {
    render(
      <InputGroup label="Website">
        <InputGroupText>https://</InputGroupText>
        <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
        <InputGroupText>.com</InputGroupText>
      </InputGroup>,
    );

    expect(screen.getByRole('group', {name: 'Website'})).toBeInTheDocument();
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.com')).toBeInTheDocument();
    expect(screen.getByRole('textbox', {name: 'URL'})).toBeInTheDocument();
  });

  it('renders description and links it via aria-describedby', () => {
    render(
      <InputGroup description="Use only numbers." label="Price">
        <InputGroupText>$</InputGroupText>
        <NumberInput
          hasClear
          isLabelHidden
          label="Amount"
          onChange={() => {}}
          value={null}
        />
      </InputGroup>,
    );

    const group = screen.getByRole('group', {name: 'Price'});
    expect(screen.getByText('Use only numbers.')).toBeInTheDocument();
    expect(group).toHaveAttribute('aria-describedby');
  });

  it('renders status message and links it via aria-describedby', () => {
    render(
      <InputGroup
        label="Price"
        status={{message: 'Price is required', type: 'error'}}>
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" onChange={() => {}} value="" />
      </InputGroup>,
    );

    const status = screen.getByRole('alert');
    const attachedStatus = statusMessageRecipe({
      statusType: 'error',
      variant: 'attached',
    });
    expect(status).toHaveTextContent('Price is required');
    expect(status).toHaveClass(attachedStatus);
    const group = screen.getByRole('group', {name: 'Price'});
    expect(group).toHaveAttribute('aria-describedby');
  });

  it('supports detached status messages', () => {
    render(
      <InputGroup
        label="Price"
        status={{message: 'Price is required', type: 'error'}}
        statusVariant="detached">
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" onChange={() => {}} value="" />
      </InputGroup>,
    );

    const detachedStatus = statusMessageRecipe({
      statusType: 'error',
      variant: 'detached',
    });
    expect(screen.getByRole('alert')).toHaveClass(detachedStatus);
  });

  it('applies data-testid, className, style, and ref', () => {
    const ref = vi.fn<(el: HTMLDivElement | null) => void>();

    render(
      <InputGroup
        className="custom-group"
        data-testid="price-group"
        label="Price"
        ref={ref}
        style={{maxWidth: 300}}>
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" onChange={() => {}} value="" />
      </InputGroup>,
    );

    const group = screen.getByTestId('price-group');
    expect(group).toHaveAttribute('role', 'group');
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('disables TextInput children and sets aria-disabled on the group', () => {
    render(
      <InputGroup data-testid="group" isDisabled label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" onChange={() => {}} value="" />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', {name: 'Amount'})).toBeDisabled();
    expect(screen.getByTestId('group')).toHaveAttribute(
      'aria-disabled',
      'true',
    );
  });

  it('disables NumberInput children when the group is disabled', () => {
    render(
      <InputGroup isDisabled label="Price">
        <InputGroupText>$</InputGroupText>
        <NumberInput
          isLabelHidden
          label="Amount"
          onChange={() => {}}
          value={0}
        />
      </InputGroup>,
    );

    expect(screen.getByRole('spinbutton', {name: 'Amount'})).toBeDisabled();
  });

  it('does not set aria-disabled when not disabled', () => {
    render(
      <InputGroup data-testid="group" label="Price">
        <TextInput isLabelHidden label="Amount" onChange={() => {}} value="" />
      </InputGroup>,
    );

    expect(screen.getByTestId('group')).not.toHaveAttribute('aria-disabled');
  });

  it('renders optional indicator text', () => {
    render(
      <InputGroup isOptional label="Website">
        <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
      </InputGroup>,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('renders required indicator text', () => {
    render(
      <InputGroup isRequired label="Website">
        <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
      </InputGroup>,
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('visually hides the label when isLabelHidden is true', () => {
    render(
      <InputGroup isLabelHidden label="Website">
        <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
      </InputGroup>,
    );

    expect(screen.getByText('Website')).toBeInTheDocument();
    expect(screen.getByRole('group', {name: 'Website'})).toBeInTheDocument();
  });

  it('uses aria-labelledby instead of aria-label', () => {
    render(
      <InputGroup data-testid="group" label="Website">
        <TextInput isLabelHidden label="URL" onChange={() => {}} value="" />
      </InputGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group).toHaveAttribute('aria-labelledby');
    expect(group).not.toHaveAttribute('aria-label');
  });

  it('propagates size to child TextInput via context, overriding its own prop', () => {
    render(
      <InputGroup data-testid="group" label="Website" size="lg">
        <TextInput
          isLabelHidden
          label="URL"
          onChange={() => {}}
          size="sm"
          value=""
        />
      </InputGroup>,
    );

    const input = screen.getByRole('textbox', {name: 'URL'});
    // eslint-disable-next-line testing-library/no-node-access
    const wrapper = input.parentElement;
    // The group's `lg` size must win over the child's own `sm` prop.
    expect(wrapper).toHaveClass(inputRecipe({size: 'lg'}));
    expect(wrapper).not.toHaveClass(inputRecipe({size: 'sm'}));
  });
});
