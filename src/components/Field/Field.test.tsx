import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {assertNonNull} from '../../internal/testHelpers';
import {Field, getNecessity} from './Field';

describe('Field', () => {
  it('renders label, description, and status', () => {
    render(
      <Field
        description="Helpful copy"
        inputId="email"
        label="Email"
        status={{type: 'error', message: 'Required'}}>
        <input id="email" />
      </Field>,
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Helpful copy')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required');
  });

  it('applies root props', () => {
    const ref = vi.fn<(element: HTMLDivElement | null) => void>();

    render(
      <Field
        className="custom-field"
        data-testid="field"
        inputId="name"
        label="Name"
        ref={ref}
        style={{color: 'red'}}>
        <input id="name" />
      </Field>,
    );

    const field = screen.getByTestId('field');
    expect(field).toHaveClass('custom-field');
    expect(field).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLDivElement));
  });

  it('does not pass htmlFor to span when labelAs is span', () => {
    const {container} = render(
      <Field
        inputId="group1"
        label="Options"
        labelAs="span"
        labelId="opt-label">
        <div aria-labelledby="opt-label" role="radiogroup" />
      </Field>,
    );

    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const labelSpan = assertNonNull(container.querySelector('#opt-label'));
    expect(labelSpan.tagName).toBe('SPAN');
    expect(labelSpan).not.toHaveAttribute('for');
  });

  it('shows Optional indicator when isOptional is true', () => {
    render(
      <Field inputId="opt" isOptional label="Name">
        <input id="opt" />
      </Field>,
    );

    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('shows Required indicator when isRequired is true', () => {
    render(
      <Field inputId="req" isRequired label="Name">
        <input id="req" />
      </Field>,
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  describe('getNecessity', () => {
    it('returns isOptional when isOptional is true', () => {
      expect(getNecessity(true, undefined)).toEqual({isOptional: true});
    });

    it('returns isRequired when isRequired is true', () => {
      expect(getNecessity(undefined, true)).toEqual({isRequired: true});
    });

    it('returns empty object when neither is set', () => {
      expect(getNecessity(undefined, undefined)).toEqual({});
    });

    it('returns isOptional when both are true (isOptional wins)', () => {
      expect(getNecessity(true, true)).toEqual({isOptional: true});
    });

    it('returns empty object when both are false', () => {
      expect(getNecessity(false, false)).toEqual({});
    });
  });
});
