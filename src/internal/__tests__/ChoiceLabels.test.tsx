import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Mail} from 'lucide-react';
import type {ReactNode} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {Badge} from 'components/Badge';
import {CheckboxGroup, CheckboxGroupItem} from 'components/CheckboxGroup';
import {Icon} from 'components/Icon';
import {RadioGroup, RadioGroupItem} from 'components/RadioGroup';

interface ChoiceProps {
  'aria-label'?: string;
  description?: ReactNode;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  label: ReactNode;
  onChange: (value: string | string[]) => void;
}

const choices = [
  {
    role: 'checkbox',
    renderChoice: ({
      isReadOnly,
      onChange,
      ...props
    }: ChoiceProps): React.JSX.Element => (
      <CheckboxGroup
        isReadOnly={isReadOnly}
        label="Plans"
        onChange={onChange}
        value={[]}>
        <CheckboxGroupItem {...props} value="pro" />
      </CheckboxGroup>
    ),
    expectedValue: ['pro'],
  },
  {
    role: 'radio',
    renderChoice: ({
      isReadOnly,
      onChange,
      ...props
    }: ChoiceProps): React.JSX.Element => (
      <RadioGroup
        isReadOnly={isReadOnly}
        label="Plans"
        onChange={onChange}
        value="">
        <RadioGroupItem {...props} value="pro" />
      </RadioGroup>
    ),
    expectedValue: 'pro',
  },
];

describe.each(choices)(
  '$role rich labels',
  ({role, renderChoice, expectedValue}) => {
    it('derives the name from formatted text and badges through a native label', () => {
      render(
        renderChoice({
          label: (
            <>
              <strong>Pro plan</strong> <Badge label="Recommended" />
            </>
          ),
          description: <em>More storage</em>,
          onChange: vi.fn(),
        }),
      );

      const input = screen.getByRole<HTMLInputElement>(role, {
        name: 'Pro plan Recommended',
      });
      expect(input.labels).toHaveLength(1);
      expect(input.labels?.[0]?.control).toBe(input);
      expect(screen.getByLabelText('Pro plan Recommended')).toBe(input);
      expect(input).toHaveAccessibleDescription('More storage');
      expect(input).not.toHaveAttribute('aria-label');
      expect(input).not.toHaveAttribute('aria-labelledby');
    });

    it('excludes decorative content from the accessible name', () => {
      render(
        renderChoice({
          label: (
            <>
              <Icon icon={Mail} />
              <strong>Email</strong>
              <span aria-hidden="true">Decorative</span>
            </>
          ),
          onChange: vi.fn(),
        }),
      );

      expect(screen.getByRole(role, {name: 'Email'})).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('supports an explicit accessible name for an icon-only label', () => {
      render(
        renderChoice({
          'aria-label': 'Email notifications',
          label: <Icon icon={Mail} />,
          onChange: vi.fn(),
        }),
      );

      expect(
        screen.getByRole(role, {name: 'Email notifications'}),
      ).toHaveAttribute('aria-label', 'Email notifications');
    });

    it.each(['Email', <strong key="email">Email</strong>])(
      'overrides the derived name and restores it when aria-label is removed (%#)',
      label => {
        const onChange = vi.fn();
        const {rerender} = render(
          renderChoice({
            'aria-label': 'Email notifications',
            label,
            onChange,
          }),
        );

        expect(
          screen.getByRole(role, {name: 'Email notifications'}),
        ).toHaveAttribute('aria-label', 'Email notifications');
        rerender(renderChoice({label, onChange}));
        expect(screen.getByRole(role, {name: 'Email'})).not.toHaveAttribute(
          'aria-label',
        );
      },
    );

    it('selects the choice exactly once when clicking formatted content or a badge', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        renderChoice({
          'aria-label': 'Pro plan Recommended option',
          label: (
            <>
              <strong>Pro plan</strong> <Badge label="Recommended" />
            </>
          ),
          onChange,
        }),
      );

      await user.click(screen.getByText('Pro plan'));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(expectedValue);
      onChange.mockClear();
      await user.click(screen.getByText('Recommended'));
      expect(onChange).toHaveBeenCalledExactlyOnceWith(expectedValue);
    });

    it.each(['disabled', 'read-only'])(
      'blocks selection through rich label content when %s',
      async state => {
        const user = userEvent.setup();
        const onChange = vi.fn();
        render(
          renderChoice({
            label: <strong>Pro plan</strong>,
            isDisabled: state === 'disabled',
            isReadOnly: state === 'read-only',
            onChange,
          }),
        );

        await user.click(screen.getByText('Pro plan'));
        // Native checked-state cancellation for label clicks is verified in
        // ChoiceLabels.browser.test.tsx; jsdom handles canceled label activation differently.
        expect(onChange).not.toHaveBeenCalled();
      },
    );
  },
);
