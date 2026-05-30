import type {Meta, StoryObj} from '@storybook/react-vite';
import {BarChart3, Settings} from 'lucide-react';
import {useState} from 'react';
import {Badge} from '../Badge';
import {Tab} from './Tab';
import {TabMenu} from './TabMenu';
import {Tabs} from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {hasDivider: true, layout: 'hug', size: 'md', value: 'overview'},
};

export default meta;
type Story = StoryObj<typeof meta>;

function TabsStory(args: React.ComponentProps<typeof Tabs>) {
  const [value, setValue] = useState(args.value);
  return (
    <Tabs {...args} onChange={setValue} value={value}>
      <Tab label="Overview" value="overview" />
      <Tab
        endContent={<Badge color="info" label="3" />}
        label="Activity"
        value="activity"
      />
      <Tab icon={Settings} label="Settings" value="settings" />
      <TabMenu
        label="More"
        options={[
          {icon: <BarChart3 />, label: 'Analytics', value: 'analytics'},
          {label: 'Reports', value: 'reports'},
        ]}
      />
    </Tabs>
  );
}

export const Default: Story = {
  render: args => <TabsStory {...args} />,
};
export const Fill: Story = {
  args: {layout: 'fill'},
  render: args => <TabsStory {...args} />,
};
