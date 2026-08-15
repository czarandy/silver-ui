import {Temporal} from '@js-temporal/polyfill';
import {fireEvent, render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import {
  AutocompleteInput,
  createStaticSearchSource,
} from 'components/AutocompleteInput';
import {CheckboxGroup, CheckboxGroupItem} from 'components/CheckboxGroup';
import {ColorSwatchPicker} from 'components/ColorSwatchPicker';
import {DateInput} from 'components/DateInput';
import {DateRangeInput} from 'components/DateRangeInput';
import {DateTimeInput} from 'components/DateTimeInput';
import {Fieldset} from 'components/Fieldset';
import {FileInput} from 'components/FileInput';
import {InputGroup} from 'components/InputGroup';
import {MultiSelect} from 'components/MultiSelect';
import {NumberInput} from 'components/NumberInput';
import {PasswordInput} from 'components/PasswordInput';
import {PinInput} from 'components/PinInput';
import {RadioGroup, RadioGroupItem} from 'components/RadioGroup';
import {Rating} from 'components/Rating';
import {
  SegmentedControl,
  SegmentedControlItem,
} from 'components/SegmentedControl';
import {Select} from 'components/Select';
import {Slider} from 'components/Slider';
import {Switch} from 'components/Switch';
import {TagsInput} from 'components/TagsInput';
import {TextArea} from 'components/TextArea';
import {TextInput} from 'components/TextInput';
import {TimeInput} from 'components/TimeInput';
import {plainDateCreate} from 'internal/plainDate';

const items = [
  {id: 'one', label: 'One'},
  {id: 'two', label: 'Two'},
];
const searchSource = createStaticSearchSource(items);

function expectNotFocusable(element: HTMLElement): void {
  expect(element).toHaveAttribute('tabindex', '-1');
  element.focus();
  expect(element).not.toHaveFocus();
}

describe('read-only behavior for form controls', () => {
  it('keeps text and date values enabled while blocking focus and edits', () => {
    const onChange = vi.fn();
    const date = plainDateCreate(2026, 8, 15);

    render(
      <>
        <TextInput isReadOnly label="Text" onChange={onChange} value="Alpha" />
        <TextArea isReadOnly label="Notes" onChange={onChange} value="Bravo" />
        <PasswordInput
          isReadOnly
          label="Password"
          onChange={onChange}
          value="secret"
        />
        <NumberInput isReadOnly label="Number" onChange={onChange} value={12} />
        <PinInput
          data-testid="pin"
          isReadOnly
          label="PIN"
          onChange={onChange}
          value="123"
        />
        <TimeInput
          isReadOnly
          label="Time"
          onChange={onChange}
          value={Temporal.PlainTime.from('09:30')}
        />
        <DateInput isReadOnly label="Date" onChange={onChange} value={date} />
        <DateRangeInput
          isReadOnly
          label="Range"
          onChange={onChange}
          value={{end: date.add({days: 1}), start: date}}
        />
        <DateTimeInput
          isReadOnly
          label="Meeting"
          onChange={onChange}
          value={Temporal.PlainDateTime.from('2026-08-15T09:30')}
        />
        <AutocompleteInput
          isReadOnly
          label="Autocomplete"
          onChange={onChange}
          searchSource={searchSource}
          value={items[0]}
        />
      </>,
    );

    const controls = [
      screen.getByLabelText('Text'),
      screen.getByLabelText('Notes'),
      screen.getByLabelText('Password'),
      screen.getByLabelText('Number'),
      ...within(screen.getByTestId('pin')).getAllByRole('textbox'),
      screen.getByLabelText('Time'),
      screen.getByLabelText('Date'),
      screen.getByRole('combobox', {name: 'Range'}),
      screen.getByLabelText('Meeting date'),
      screen.getByLabelText('Meeting time'),
      screen.getByLabelText('Autocomplete'),
    ];

    for (const control of controls) {
      expect(control).toBeEnabled();
      expectNotFocusable(control);
    }

    fireEvent.change(screen.getByLabelText('Text'), {
      target: {value: 'changed'},
    });
    fireEvent.change(screen.getByLabelText('Number'), {
      target: {value: '99'},
    });
    fireEvent.change(screen.getByLabelText('Time'), {
      target: {value: '10:30'},
    });
    fireEvent.change(screen.getByLabelText('Date'), {
      target: {value: '2027-01-01'},
    });
    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('button', {name: 'Show password'}),
    ).not.toBeInTheDocument();
  });

  it('blocks selection controls without disabled semantics or styling', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <>
        <Select
          isReadOnly
          label="Select"
          onChange={onChange}
          options={['one', 'two']}
          value="one"
        />
        <MultiSelect
          isReadOnly
          label="Multi"
          onChange={onChange}
          options={['one', 'two']}
          value={['one']}
        />
        <FileInput
          data-testid="file"
          isReadOnly
          label="File"
          onChange={onChange}
          value={null}
        />
        <CheckboxGroup
          isReadOnly
          label="Checks"
          onChange={onChange}
          value={['one']}>
          <CheckboxGroupItem label="Check one" value="one" />
          <CheckboxGroupItem label="Check two" value="two" />
        </CheckboxGroup>
        <RadioGroup isReadOnly label="Radios" onChange={onChange} value="one">
          <RadioGroupItem label="Radio one" value="one" />
          <RadioGroupItem label="Radio two" value="two" />
        </RadioGroup>
        <Switch isReadOnly isSelected label="Switch" onChange={onChange} />
        <Slider isReadOnly label="Slider" onChange={onChange} value={40} />
        <ColorSwatchPicker
          colors={['red', 'blue']}
          isReadOnly
          label="Color"
          onChange={onChange}
          value="red"
        />
        <SegmentedControl
          isReadOnly
          label="Segments"
          onChange={onChange}
          value="one">
          <SegmentedControlItem label="Segment one" value="one" />
          <SegmentedControlItem label="Segment two" value="two" />
        </SegmentedControl>
      </>,
    );

    const controls = [
      screen.getByRole('combobox', {name: 'Select'}),
      screen.getByRole('combobox', {name: 'Multi'}),
      screen.getByTestId('file'),
      screen.getByRole('checkbox', {name: 'Check two'}),
      screen.getByRole('radio', {name: 'Radio two'}),
      screen.getByRole('switch', {name: 'Switch'}),
      screen.getByRole('slider', {name: 'Slider'}),
      within(screen.getByRole('radiogroup', {name: 'Color'})).getByRole(
        'radio',
        {name: 'Blue'},
      ),
      screen.getByRole('radio', {name: 'Segment two'}),
    ];

    for (const control of controls) {
      expect(control).toBeEnabled();
      expectNotFocusable(control);
      await user.click(control);
      expect(control).not.toHaveFocus();
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('preserves read-only values in FormData', () => {
    render(
      <form data-testid="form">
        <TextInput
          htmlName="text"
          isReadOnly
          label="Text"
          onChange={() => {}}
          value="Alpha"
        />
        <NumberInput
          htmlName="number"
          isReadOnly
          label="Number"
          onChange={() => {}}
          value={12}
        />
        <PinInput
          htmlName="pin"
          isReadOnly
          label="PIN"
          onChange={() => {}}
          value="123456"
        />
        <TimeInput
          htmlName="time"
          isReadOnly
          label="Time"
          onChange={() => {}}
          value={Temporal.PlainTime.from('09:30')}
        />
        <Select
          htmlName="select"
          isReadOnly
          label="Select"
          onChange={() => {}}
          options={['one', 'two']}
          value="one"
        />
        <MultiSelect
          htmlName="multi"
          isReadOnly
          label="Multi"
          onChange={() => {}}
          options={['one', 'two']}
          value={['one', 'two']}
        />
        <TagsInput
          htmlName="tags"
          isReadOnly
          label="Tags"
          onChange={() => {}}
          searchSource={searchSource}
          value={items}
        />
        <CheckboxGroup
          htmlName="checks"
          isReadOnly
          label="Checks"
          onChange={() => {}}
          value={['one']}>
          <CheckboxGroupItem label="Check one" value="one" />
        </CheckboxGroup>
        <RadioGroup
          htmlName="radio"
          isReadOnly
          label="Radio"
          onChange={() => {}}
          value="one">
          <RadioGroupItem label="Radio one" value="one" />
        </RadioGroup>
        <Switch
          htmlName="switch"
          isReadOnly
          isSelected
          label="Switch"
          onChange={() => {}}
        />
        <Slider
          htmlName="slider"
          isReadOnly
          label="Slider"
          onChange={() => {}}
          value={40}
        />
        <Rating htmlName="rating" isReadOnly value={3} />
      </form>,
    );

    const formData = new FormData(screen.getByTestId('form'));
    expect(formData.get('text')).toBe('Alpha');
    expect(formData.get('number')).toBe('12');
    expect(formData.get('pin')).toBe('123456');
    expect(formData.get('time')).toBe('09:30');
    expect(formData.get('select')).toBe('one');
    expect(formData.getAll('multi')).toEqual(['one', 'two']);
    expect(formData.getAll('tags')).toEqual(['one', 'two']);
    expect(formData.get('checks')).toBe('one');
    expect(formData.get('radio')).toBe('one');
    expect(formData.get('switch')).toBe('on');
    expect(formData.get('slider')).toBe('40');
    expect(formData.get('rating')).toBe('3');
  });

  it('propagates read-only state through InputGroup and Fieldset', () => {
    render(
      <>
        <InputGroup isReadOnly label="Grouped">
          <TextInput label="First" onChange={() => {}} value="one" />
          <TextInput label="Second" onChange={() => {}} value="two" />
        </InputGroup>
        <Fieldset isReadOnly legend="Profile">
          <TextInput label="Name" onChange={() => {}} value="Ada" />
          <Switch isSelected label="Active" onChange={() => {}} />
        </Fieldset>
      </>,
    );

    for (const control of [
      screen.getByLabelText('First'),
      screen.getByLabelText('Second'),
      screen.getByLabelText('Name'),
      screen.getByRole('switch', {name: 'Active'}),
    ]) {
      expect(control).toBeEnabled();
      expectNotFocusable(control);
    }
  });

  it('lets disabled state take precedence over read-only state', () => {
    render(
      <TextInput
        isDisabled
        isReadOnly
        label="Disabled"
        onChange={() => {}}
        value="value"
      />,
    );

    const input = screen.getByLabelText('Disabled');
    expect(input).toBeDisabled();
    expect(input).not.toHaveAttribute('readonly');
    expect(input).not.toHaveAttribute('tabindex');
  });
});
