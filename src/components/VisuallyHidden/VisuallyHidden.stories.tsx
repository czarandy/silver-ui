import type {Meta, StoryObj} from '@storybook/react-vite';
import {useState} from 'react';
import {Button} from 'components/Button';
import {Text} from 'components/Text';
import {VisuallyHidden} from 'components/VisuallyHidden';
import {css} from 'styled-system/css';

const meta = {
  title: 'Components/VisuallyHidden',
  component: VisuallyHidden,
  args: {
    children: 'This text is only announced by screen readers.',
  },
} satisfies Meta<typeof VisuallyHidden>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The content is present in the accessibility tree but rendered off-screen, so
 * nothing visible appears in the preview below — inspect it with a screen
 * reader or the browser's accessibility inspector.
 */
export const Default: Story = {};

/**
 * A common use: give an icon-only control an accessible name without showing a
 * visible label. The glyph is hidden from assistive technology with
 * `aria-hidden`, and `VisuallyHidden` supplies the announced name.
 */
export const IconOnlyControlLabel: Story = {
  render: () => (
    <button
      className={css({
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        w: '10',
        h: '10',
        borderWidth: '1px',
        borderColor: 'border',
        rounded: 'md',
        cursor: 'pointer',
      })}
      type="button">
      <span aria-hidden="true">★</span>
      <VisuallyHidden>Add to favorites</VisuallyHidden>
    </button>
  ),
};

/**
 * Supplement a visible abbreviation with an expanded description for assistive
 * technology.
 */
export const InlineWithVisibleText: Story = {
  render: () => (
    <Text as="p" type="body">
      Uploaded 5 <span aria-hidden="true">GB</span>
      <VisuallyHidden>gigabytes</VisuallyHidden> of data.
    </Text>
  ),
};

/**
 * Use the polymorphic `as` prop to render a block-level element — required for
 * an `aria-live` region, which an inline `span` cannot host reliably. Activate
 * the button with a screen reader running: the count change is announced
 * without any visible status text. Accessibility props (`aria-live`, `role`)
 * pass through even though styling is locked down.
 */
export const LiveRegionAnnouncer: Story = {
  render: function LiveRegionAnnouncer() {
    const [count, setCount] = useState(0);

    return (
      <div
        className={css({display: 'flex', flexDirection: 'column', gap: '3'})}>
        <Button label="Add item" onClick={() => setCount(value => value + 1)} />
        <Text as="p" type="body">
          {count} item{count === 1 ? '' : 's'} added (this text is visible; the
          announcement below is not).
        </Text>
        <VisuallyHidden aria-live="polite" as="div" role="status">
          {count === 0 ? '' : `${count} items in the list`}
        </VisuallyHidden>
      </div>
    );
  },
};
