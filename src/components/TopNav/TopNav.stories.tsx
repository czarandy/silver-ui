import type {Meta, StoryObj} from '@storybook/react-vite';
import {Button} from '../Button';
import {TopNav} from './TopNav';
import {TopNavHeading} from './TopNavHeading';
import {TopNavItem} from './TopNavItem';

const meta: Meta<typeof TopNav> = {
  title: 'Components/TopNav',
  component: TopNav,
  args: {
    label: 'Main navigation',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: args => (
    <TopNav
      {...args}
      endContent={<Button label="Create" size="sm" variant="primary" />}
      heading={<TopNavHeading heading="Silver UI" />}>
      <TopNavItem href="/docs" isSelected label="Docs" />
      <TopNavItem href="/components" label="Components" />
    </TopNav>
  ),
};
