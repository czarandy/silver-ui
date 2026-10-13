import {composeStory} from '@storybook/react';
import {act, render, screen} from '@testing-library/react';
import {Mail} from 'lucide-react';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {userEvent} from 'vitest/browser';
import {Badge} from 'components/Badge';
import {
  CheckboxGroup,
  CheckboxGroupItem,
  type CheckboxGroupProps,
} from 'components/CheckboxGroup';
import * as checkboxStories from 'components/CheckboxGroup/CheckboxGroup.stories';
import {Icon} from 'components/Icon';
import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupProps,
} from 'components/RadioGroup';
import * as radioStories from 'components/RadioGroup/RadioGroup.stories';
import {assertNonNull} from 'internal/testHelpers';

const CheckboxRichLabels = composeStory<CheckboxGroupProps>(
  checkboxStories.RichLabels,
  checkboxStories.default,
);
const RadioRichLabels = composeStory<RadioGroupProps>(
  radioStories.RichLabels,
  radioStories.default,
);

describe.each([
  ['checkbox', CheckboxRichLabels],
  ['radio', RadioRichLabels],
] as const)('%s rich-label story layout', (role, Story) => {
  it('leaves a visible token gap between the label text and badge', () => {
    render(<Story />);
    const text = screen.getByText('Email');
    // eslint-disable-next-line testing-library/no-node-access -- measure the badge surface rather than its padded text slot
    const badge = assertNonNull(screen.getByText('Recommended').parentElement);

    expect(
      badge.getBoundingClientRect().left - text.getBoundingClientRect().right,
    ).toBeCloseTo(8, 1);
    expect(screen.getByRole(role, {name: 'Email Recommended'})).toBeChecked();
  });
});

function Example({
  role,
  isDisabled,
  isReadOnly,
}: {
  role: 'checkbox' | 'radio';
  isDisabled?: boolean;
  isReadOnly?: boolean;
}): React.JSX.Element {
  const [checkedValues, setCheckedValues] = useState<string[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const label = (
    <>
      <Icon data-testid="decorative-icon" icon={Mail} />
      <strong>Pro plan</strong> <Badge label="Recommended" />
    </>
  );

  return role === 'checkbox' ? (
    <CheckboxGroup
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      label="Plans"
      onChange={setCheckedValues}
      value={checkedValues}>
      <CheckboxGroupItem
        aria-label="Pro plan Recommended option"
        label={label}
        value="pro"
      />
    </CheckboxGroup>
  ) : (
    <RadioGroup
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      label="Plans"
      onChange={setSelectedValue}
      value={selectedValue}>
      <RadioGroupItem
        aria-label="Pro plan Recommended option"
        label={label}
        value="pro"
      />
    </RadioGroup>
  );
}

describe.each(['checkbox', 'radio'] as const)(
  '%s native rich label activation',
  role => {
    it.each(['disabled', 'read-only'])(
      'preserves the unchecked native state when clicking a rich %s label',
      async state => {
        render(
          <Example
            isDisabled={state === 'disabled'}
            isReadOnly={state === 'read-only'}
            role={role}
          />,
        );
        const input = screen.getByRole(role, {
          name: 'Pro plan Recommended option',
        });
        // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native events do not wrap React updates in act
        await act(async () => {
          await userEvent.click(screen.getByText('Pro plan'), {force: true});
        });
        await expect.element(input).not.toBeChecked();
      },
    );

    it.each(['Pro plan', 'Recommended', 'decorative icon'])(
      'selects the control by clicking %s',
      async content => {
        render(<Example role={role} />);
        const input = screen.getByRole<HTMLInputElement>(role, {
          name: 'Pro plan Recommended option',
        });
        const target =
          content === 'decorative icon'
            ? screen.getByTestId('decorative-icon')
            : screen.getByText(content);

        expect(input.labels?.[0]?.control).toBe(input);
        // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native events do not wrap React updates in act
        await act(async () => {
          await userEvent.click(target);
        });

        await expect.element(input).toBeChecked();
        expect(input).toHaveAccessibleName('Pro plan Recommended option');
      },
    );

    it('remains keyboard focusable and selectable', async () => {
      render(<Example role={role} />);
      const input = screen.getByRole(role, {
        name: 'Pro plan Recommended option',
      });
      // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native events do not wrap React updates in act
      await act(async () => {
        await userEvent.tab();
      });
      expect(input).toHaveFocus();
      // eslint-disable-next-line testing-library/no-unnecessary-act -- Vitest's native events do not wrap React updates in act
      await act(async () => {
        await userEvent.keyboard(' ');
      });
      await expect.element(input).toBeChecked();
    });
  },
);
