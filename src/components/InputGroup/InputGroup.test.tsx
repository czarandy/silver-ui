import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {NumberInput} from '../NumberInput';
import {TextInput} from '../TextInput';
import {InputGroup} from './InputGroup';
import {InputGroupText} from './InputGroupText';

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

  it('renders description and status text', () => {
    render(
      <InputGroup
        description="Use only numbers."
        label="Price"
        status={{message: 'Price is required', type: 'error'}}>
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

    expect(screen.getByText('Use only numbers.')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Price is required');
  });

  it('applies data-testid to the group element', () => {
    render(
      <InputGroup data-testid="price-group" label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" value="" />
      </InputGroup>,
    );

    expect(screen.getByTestId('price-group')).toHaveAttribute('role', 'group');
  });

  it('disables supported child inputs when the group is disabled', () => {
    render(
      <InputGroup isDisabled label="Price">
        <InputGroupText>$</InputGroupText>
        <TextInput isLabelHidden label="Amount" value="" />
      </InputGroup>,
    );

    expect(screen.getByRole('textbox', {name: 'Amount'})).toBeDisabled();
  });
});
