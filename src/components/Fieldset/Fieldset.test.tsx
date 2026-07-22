/* eslint-disable testing-library/no-node-access -- direct-child legend and stack markup are part of the component contract */

import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {Field} from 'components/Field';
import {Fieldset} from 'components/Fieldset/Fieldset';
import {fieldsetRecipe} from 'components/Fieldset/Fieldset.recipe';
import {MultiSelect} from 'components/MultiSelect';
import {stackRecipe} from 'components/Stack/internal/Stack.recipe';
import {TextInput} from 'components/TextInput';
import {assertNonNull} from 'internal/testHelpers';

describe('Fieldset', () => {
  it('renders an actual fieldset named by its first-child legend', () => {
    render(
      <Fieldset legend="Shipping address">
        <input aria-label="Street" />
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Shipping address'});
    const legend = screen.getByText('Shipping address').closest('legend');

    expect(group.tagName).toBe('FIELDSET');
    expect(legend).not.toBeNull();
    expect(group.firstElementChild).toBe(legend);
    expect(group).not.toHaveAttribute('role');
    expect(group).not.toHaveAttribute('aria-labelledby');
  });

  it('keeps child fields independently labeled and wrapped', () => {
    render(
      <Fieldset legend="Profile">
        <Field inputId="first-name" label="First name">
          <input id="first-name" />
        </Field>
        <Field inputId="last-name" label="Last name">
          <input id="last-name" />
        </Field>
      </Fieldset>,
    );

    const firstInput = screen.getByRole('textbox', {name: 'First name'});
    const lastInput = screen.getByRole('textbox', {name: 'Last name'});

    expect(firstInput.closest('div')).not.toBeNull();
    expect(lastInput.closest('div')).not.toBeNull();
    expect(firstInput.closest('div')).not.toBe(lastInput.closest('div'));
    expect(screen.getByText('First name')).toBeVisible();
    expect(screen.getByText('Last name')).toBeVisible();
  });

  it('links caller, description, and status IDs in aria-describedby', () => {
    render(
      <>
        <p id="external-help">Complete every field.</p>
        <Fieldset
          aria-describedby="external-help"
          description="Used for delivery."
          legend="Shipping address"
          status={{message: 'Address is incomplete.', type: 'error'}}>
          <input aria-label="Street" />
        </Fieldset>
      </>,
    );

    const group = screen.getByRole('group', {name: 'Shipping address'});
    const description = screen.getByText('Used for delivery.');
    const status = screen.getByRole('alert');

    expect(group).toHaveAttribute(
      'aria-describedby',
      `external-help ${description.id} ${status.id}`,
    );
  });

  it('omits aria-describedby when there are no referenced messages', () => {
    render(
      <Fieldset legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    expect(screen.getByRole('group', {name: 'Profile'})).not.toHaveAttribute(
      'aria-describedby',
    );
  });

  it('treats an empty-string description as absent', () => {
    render(
      <Fieldset description="" legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Profile'});
    expect(group).not.toHaveAttribute('aria-describedby');
    expect(group.querySelector('p')).toBeNull();
  });

  it('retains valid falsy description content', () => {
    render(
      <Fieldset description={0} legend="Attempts">
        <input aria-label="Count" />
      </Fieldset>,
    );

    const description = screen.getByText('0');
    expect(screen.getByRole('group', {name: 'Attempts'})).toHaveAttribute(
      'aria-describedby',
      description.id,
    );
  });

  it('uses error accessibility semantics for an error summary', () => {
    render(
      <Fieldset
        legend="Profile"
        status={{message: 'Fix the highlighted fields.', type: 'error'}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Profile'});
    const summary = screen.getByRole('alert');

    expect(group).toHaveAttribute('aria-invalid', 'true');
    expect(summary).toHaveAttribute('aria-live', 'assertive');
    expect(group).toHaveAttribute('aria-describedby', summary.id);
  });

  it('renders the status summary detached below the fieldset box', () => {
    render(
      <Fieldset
        legend="Profile"
        status={{message: 'Fix the highlighted fields.', type: 'error'}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Profile'});
    const summary = screen.getByRole('alert');

    expect(group).not.toContainElement(summary);
    expect(summary.previousElementSibling).toBe(group);
    expect(summary.parentElement).toBe(group.parentElement);
  });

  it('applies className, style, and hidden to the wrapper so they cover the summary', () => {
    const {container} = render(
      <Fieldset
        className="custom-fieldset"
        legend="Profile"
        status={{message: 'Fix the highlighted fields.', type: 'error'}}
        style={{maxWidth: 480}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Profile'});
    const wrapper = assertNonNull(group.parentElement);

    expect(container.firstElementChild).toBe(wrapper);
    expect(wrapper).toHaveClass('custom-fieldset');
    expect(wrapper).toHaveStyle({maxWidth: '480px'});
    expect(wrapper).toContainElement(screen.getByRole('alert'));
  });

  it('hides the status summary along with the hidden fieldset', () => {
    render(
      <Fieldset
        hidden
        legend="Profile"
        status={{message: 'Fix the highlighted fields.', type: 'error'}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    expect(screen.getByText('Fix the highlighted fields.')).not.toBeVisible();
  });

  it.each([
    ['warning', 'Review these values.'],
    ['success', 'All values are valid.'],
  ] as const)(
    'uses polite status semantics for %s summaries',
    (type, message) => {
      render(
        <Fieldset legend="Profile" status={{message, type}}>
          <input aria-label="Name" />
        </Fieldset>,
      );

      const group = screen.getByRole('group', {name: 'Profile'});
      const summary = screen.getByRole('status');

      expect(group).not.toHaveAttribute('aria-invalid');
      expect(summary).toHaveAttribute('aria-live', 'polite');
      expect(summary).toHaveTextContent(message);
    },
  );

  it('renders the optional legend indicator consistently with Field', () => {
    render(
      <Fieldset isOptional legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    expect(screen.getByText('Optional')).toHaveClass('silver-fs_xs');
  });

  it('renders the indicator and description with muted text color', () => {
    render(
      <Fieldset description="Used for delivery." isOptional legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    const mutedColorClass =
      'silver-c_var(--silver-text-color-muted,_var(--silver-colors-fg-muted))';
    expect(screen.getByText('Optional')).toHaveClass(mutedColorClass);
    expect(screen.getByText('Used for delivery.')).toHaveClass(mutedColorClass);
  });

  it('renders the required legend indicator consistently with Field', () => {
    render(
      <Fieldset isRequired legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    expect(screen.getByText('Required')).toHaveClass('silver-fs_xs');
  });

  it('uses native fieldset disabling for descendant form controls', () => {
    render(
      <Fieldset isDisabled legend="Profile">
        <label>
          Name
          <input />
        </label>
        <label>
          Role
          <select>
            <option>Engineer</option>
          </select>
        </label>
        <label>
          Notes
          <textarea />
        </label>
        <button type="button">Save</button>
      </Fieldset>,
    );

    const group = screen.getByRole('group', {name: 'Profile'});
    expect(group).toBeDisabled();
    expect(screen.getByRole('textbox', {name: 'Name'})).toBeDisabled();
    expect(screen.getByRole('combobox', {name: 'Role'})).toBeDisabled();
    expect(screen.getByRole('textbox', {name: 'Notes'})).toBeDisabled();
    expect(screen.getByRole('button', {name: 'Save'})).toBeDisabled();
  });

  it('cascades disabled to silver-ui inputs through context', () => {
    render(
      <Fieldset isDisabled legend="Profile">
        <TextInput label="Name" onChange={() => {}} value="" />
        <MultiSelect
          label="Columns"
          onChange={() => {}}
          options={['Name', 'Email']}
          value={[]}
        />
      </Fieldset>,
    );

    expect(screen.getByRole('textbox', {name: 'Name'})).toBeDisabled();
    expect(screen.getByRole('combobox', {name: 'Columns'})).toBeDisabled();
  });

  it('does not open a select listbox inside a disabled fieldset', async () => {
    const user = userEvent.setup();

    render(
      <Fieldset isDisabled legend="Profile">
        <MultiSelect
          label="Columns"
          onChange={() => {}}
          options={['Name', 'Email']}
          value={[]}
        />
      </Fieldset>,
    );

    const trigger = screen.getByRole('combobox', {name: 'Columns'});
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('cascades disabled through nested fieldsets', () => {
    render(
      <Fieldset isDisabled legend="Outer">
        <Fieldset legend="Inner">
          <MultiSelect
            label="Columns"
            onChange={() => {}}
            options={['Name', 'Email']}
            value={[]}
          />
        </Fieldset>
      </Fieldset>,
    );

    expect(screen.getByRole('group', {name: 'Inner'})).toBeDisabled();
    expect(screen.getByRole('combobox', {name: 'Columns'})).toBeDisabled();
  });

  it('does not emit disabled in the enabled state', () => {
    render(
      <Fieldset legend="Profile">
        <input aria-label="Name" />
      </Fieldset>,
    );

    expect(screen.getByRole('group', {name: 'Profile'})).toBeEnabled();
    expect(screen.getByRole('textbox', {name: 'Name'})).toBeEnabled();
  });

  it('lays out children in a vertical stack with the fixed gap', () => {
    render(
      <Fieldset legend="Profile">
        <span>First child</span>
        <span>Second child</span>
      </Fieldset>,
    );

    const content = assertNonNull(
      screen.getByText('First child').parentElement,
    );
    expect(content).toHaveClass(stackRecipe({direction: 'vertical', gap: 4}));
  });

  it('forwards native props, className, style, data-testid, and ref', () => {
    const ref = vi.fn<(element: HTMLFieldSetElement | null) => void>();

    render(
      <Fieldset
        className="custom-fieldset"
        data-testid="fieldset"
        form="profile-form"
        id="profile-fields"
        legend="Profile"
        name="profile"
        ref={ref}
        style={{maxWidth: 480}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    const group = screen.getByTestId('fieldset');
    const wrapper = assertNonNull(group.parentElement);
    expect(group.tagName).toBe('FIELDSET');
    expect(group).toHaveAttribute('form', 'profile-form');
    expect(group).toHaveAttribute('id', 'profile-fields');
    expect(group).toHaveAttribute('name', 'profile');
    expect(wrapper).toHaveClass('custom-fieldset');
    expect(wrapper).toHaveStyle({maxWidth: '480px'});
    expect(ref).toHaveBeenCalledWith(group);
  });

  it('applies disabled and status recipe variants to the root', () => {
    render(
      <Fieldset
        data-testid="fieldset"
        isDisabled
        legend="Profile"
        status={{type: 'warning'}}>
        <input aria-label="Name" />
      </Fieldset>,
    );

    const expectedClasses = fieldsetRecipe({
      isDisabled: true,
      statusType: 'warning',
    });
    expect(screen.getByTestId('fieldset')).toHaveClass(
      expectedClasses.root ?? '',
    );
  });
});
