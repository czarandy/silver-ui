import {render, screen} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {Field} from './Field';

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
});
