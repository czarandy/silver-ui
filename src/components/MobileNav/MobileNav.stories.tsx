import type {Meta, StoryObj} from '@storybook/react-vite';
import {Home, Settings} from 'lucide-react';
import type {ComponentProps} from 'react';
import {useState} from 'react';
import {Button} from '../Button';
import {SideNavItem} from '../SideNav';
import {MobileNav} from './MobileNav';

const meta: Meta<typeof MobileNav> = {
  title: 'Components/MobileNav',
  component: MobileNav,
  args: {
    header: 'Navigation',
    side: 'end',
    width: 320,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function ControlledExample(args: ComponentProps<typeof MobileNav>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button label="Open navigation" onClick={() => setIsOpen(true)} />
      <MobileNav {...args} isOpen={isOpen} onOpenChange={setIsOpen}>
        <SideNavItem href="/home" icon={<Home />} label="Home" />
        <SideNavItem href="/settings" icon={<Settings />} label="Settings" />
      </MobileNav>
    </>
  );
}

export const Controlled: Story = {
  render: args => <ControlledExample {...args} />,
};
