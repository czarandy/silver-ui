import type {Meta, StoryObj} from '@storybook/react-vite';
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
 * Because it renders a plain `span`, extra props (such as a `className`) are
 * forwarded to the underlying element.
 */
export const WithForwardedProps: Story = {
  render: () => (
    <div className={css({borderWidth: '1px', borderColor: 'border', p: '4'})}>
      <Text as="p" type="body">
        There is a visually hidden note attached to this box.
      </Text>
      <VisuallyHidden className={css({fontWeight: 'bold'})}>
        Hidden note for screen readers only.
      </VisuallyHidden>
    </div>
  ),
};
