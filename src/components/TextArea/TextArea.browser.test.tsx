import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {describe, expect, it} from 'vitest';
import {TextArea} from 'components/TextArea/TextArea';

// Real-layout auto-grow tests. jsdom has no layout, so it cannot show the
// textarea's measured height or a scroll container clamping its position.

const LONG_NOTE = Array.from({length: 80}, (_, index) => `Line ${index}`).join(
  '\n',
);

function ScrolledNote(): React.JSX.Element {
  const [value, setValue] = useState(LONG_NOTE);
  return (
    <div data-testid="scroller" style={{height: 400, overflowY: 'auto'}}>
      <div style={{height: 600}} />
      <TextArea label="Notes" minRows={3} onChange={setValue} value={value} />
    </div>
  );
}

describe('TextArea auto-grow', () => {
  it('grows to fit its content without scrolling', () => {
    render(<ScrolledNote />);

    const textarea = screen.getByRole('textbox', {name: 'Notes'});
    expect(textarea.scrollHeight).toBeLessThanOrEqual(textarea.clientHeight);
    expect(textarea.clientHeight).toBeGreaterThan(80 * 20);
  });

  it('keeps the scroll position while typing at the bottom of the page', async () => {
    const user = userEvent.setup();
    render(<ScrolledNote />);
    const scroller = screen.getByTestId('scroller');
    const textarea = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Notes',
    });
    scroller.scrollTop = scroller.scrollHeight;
    const scrollTop = scroller.scrollTop;
    textarea.focus({preventScroll: true});
    textarea.setSelectionRange(LONG_NOTE.length - 10, LONG_NOTE.length - 10);

    await user.keyboard('x');

    expect(textarea.value).toContain('x');
    expect(scroller.scrollTop).toBe(scrollTop);
  });
});
