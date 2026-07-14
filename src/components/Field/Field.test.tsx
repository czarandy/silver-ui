import {render, screen} from '@testing-library/react';
import {Mail} from 'lucide-react';
import {describe, expect, it, vi} from 'vitest';
import {Field, getNecessity} from 'components/Field/Field';
import {fieldRecipe} from 'components/Field/Field.recipe';
import {inputRecipe} from 'components/Field/inputStyles';
import {assertNonNull} from 'internal/testHelpers';
import {token} from 'styled-system/tokens';

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

    expect(screen.getByText('Optional')).toHaveClass('silver-fs_xs');
  });

  it('shows Required indicator when isRequired is true', () => {
    render(
      <Field inputId="req" isRequired label="Name">
        <input id="req" />
      </Field>,
    );

    expect(screen.getByText('Required')).toHaveClass('silver-fs_xs');
  });

  it('baseline-aligns label text and necessity indicators while centering icons', () => {
    const {container} = render(
      <Field
        inputId="alignment"
        isRequired
        label="Name"
        labelIcon={Mail}
        labelTooltip="Why we need this">
        <input id="alignment" />
      </Field>,
    );
    const classes = fieldRecipe();

    // eslint-disable-next-line testing-library/no-node-access -- verifying alignment classes on the label and its icon children
    expect(screen.getByText('Name').parentElement).toHaveClass(
      classes.label ?? '',
    );
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- icons are intentionally hidden from the accessibility tree
    const icons = container.querySelectorAll('svg');
    expect(icons).toHaveLength(2);
    expect(icons[0]).toHaveClass(classes.labelIcon ?? '');
    // eslint-disable-next-line testing-library/no-node-access -- the tooltip alignment class belongs to the icon wrapper
    expect(icons[1].parentElement).toHaveClass(classes.tooltipIcon ?? '');
    expect(classes.label).toContain('silver-ai_baseline');
    expect(classes.labelIcon).toContain('silver-as_center');
    expect(classes.tooltipIcon).toContain('silver-as_center');
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

  describe('focus shadow tokens', () => {
    it('renders every focus ring as an inset shadow', () => {
      expect(token('shadows.focus')).toMatch(/^inset /);
      expect(token('shadows.focus.error')).toMatch(/^inset /);
      expect(token('shadows.focus.warning')).toMatch(/^inset /);
      expect(token('shadows.focus.success')).toMatch(/^inset /);
    });
  });

  describe('focus border color', () => {
    // Regression: `_hover` and `_focusWithin` set border-color at equal
    // specificity, so hovering a focused input used to swap the focus border
    // for the hover color. The recipe must re-assert the focus border under
    // `:focus-within:hover` so it wins while hovered.
    it('keeps the primary border when a focused input is hovered', () => {
      expect(inputRecipe()).toContain('focusWithin:hover:silver-bd-c_primary');
    });

    it.each([
      ['error', 'focusWithin:hover:silver-bd-c_status.error.border'],
      ['warning', 'focusWithin:hover:silver-bd-c_status.warning.border'],
      ['success', 'focusWithin:hover:silver-bd-c_status.success.border'],
    ] as const)(
      'keeps the %s status border when a focused input is hovered',
      (status, expectedClass) => {
        expect(inputRecipe({status})).toContain(expectedClass);
      },
    );
  });
});
