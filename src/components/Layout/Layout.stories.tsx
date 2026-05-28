import type {Meta, StoryObj} from '@storybook/react-vite';
import {Layout} from './Layout';
import {LayoutContent} from './LayoutContent';
import {LayoutHeader} from './LayoutHeader';
import {LayoutPanel} from './LayoutPanel';

const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  args: {
    height: 'fill',
    padding: 0,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <div style={{height: 420}}>
      <Layout
        {...args}
        content={<LayoutContent>Main content</LayoutContent>}
        header={<LayoutHeader hasDivider>Header</LayoutHeader>}
        start={
          <LayoutPanel hasDivider width={220}>
            Start panel
          </LayoutPanel>
        }
      />
    </div>
  ),
};
