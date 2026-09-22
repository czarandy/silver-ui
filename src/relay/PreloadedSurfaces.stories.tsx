/* eslint-disable @eslint-react/rules-of-hooks -- Storybook render functions support hooks */
import type {Meta, StoryObj} from '@storybook/react-vite';
import {RelayEnvironmentProvider} from 'react-relay';
import {Environment, Network, RecordSource, Store} from 'relay-runtime';
import {Button} from 'components/Button';
import {HStack, VStack} from 'components/Stack';
import {Text} from 'components/Text';
import type {PreloadedSurfaceStoryEntryPointProps} from 'relay/PreloadedSurfacesStoryContent';
import {createJSResourceReference} from 'relay/createJSResourceReference';
import {usePreloadedDialog} from 'relay/usePreloadedDialog';
import {usePreloadedDrawer} from 'relay/usePreloadedDrawer';
import {usePreloadedHoverCard} from 'relay/usePreloadedHoverCard';
import {usePreloadedPopover} from 'relay/usePreloadedPopover';
import {cva} from 'styled-system/css';

const MODULE_DELAY_MS = 1500;

interface DemoParams {
  surface: 'dialog' | 'drawer' | 'hover-card' | 'popover';
  title: string;
}

function createDelayedEntryPoint(moduleId: string) {
  return {
    getPreloadProps: ({surface, title}: DemoParams) => ({
      extraProps: {surface, title},
    }),
    root: createJSResourceReference(
      moduleId,
      async (): Promise<{
        default: React.ComponentType<PreloadedSurfaceStoryEntryPointProps>;
      }> => {
        await new Promise(resolve => setTimeout(resolve, MODULE_DELAY_MS));
        return import('relay/PreloadedSurfacesStoryContent');
      },
    ),
  };
}

const drawerEntryPoint = createDelayedEntryPoint('PreloadedDrawerStory');
const dialogEntryPoint = createDelayedEntryPoint('PreloadedDialogStory');
const popoverEntryPoint = createDelayedEntryPoint('PreloadedPopoverStory');
const hoverCardEntryPoint = createDelayedEntryPoint('PreloadedHoverCardStory');
let refreshingPopoverLoadCount = 0;
const refreshingPopoverEntryPoint = {
  getPreloadProps: (params: DemoParams) => ({
    extraProps: {...params, loadCount: ++refreshingPopoverLoadCount},
  }),
  root: popoverEntryPoint.root,
};

const popoverStoryContentRecipe = cva({
  base: {
    w: '320px',
  },
});

const environment = new Environment({
  network: Network.create(async () => {
    await Promise.resolve();
    return {data: {}};
  }),
  store: new Store(new RecordSource()),
});

function StoryFrame({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <VStack gap={3} style={{alignItems: 'flex-start'}}>
      <Text as="p" color="secondary">
        The demo waits {MODULE_DELAY_MS / 1000} seconds before resolving its
        EntryPoint module so the loading state remains visible.
      </Text>
      {children}
    </VStack>
  );
}

const meta = {
  title: 'Integrations/Relay preloaded surfaces',
  decorators: [
    Story => (
      <RelayEnvironmentProvider environment={environment}>
        <Story />
      </RelayEnvironmentProvider>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'Relay EntryPoint-backed surfaces that load code and data on demand. Each example includes an intentional module delay to demonstrate the default loading UI.',
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Drawer: Story = {
  render: () => {
    const drawer = usePreloadedDrawer(drawerEntryPoint, {
      label: 'Preloaded drawer example',
      placement: 'end',
      size: 420,
    });

    return (
      <StoryFrame>
        <Button
          label="Open preloaded drawer"
          onClick={() =>
            drawer.show(
              {surface: 'drawer', title: 'Preloaded drawer'},
              {message: 'Drawer content loaded through a Relay EntryPoint.'},
            )
          }
        />
        {drawer.element}
      </StoryFrame>
    );
  },
};

export const Dialog: Story = {
  render: () => {
    const dialog = usePreloadedDialog(dialogEntryPoint, {
      label: 'Preloaded dialog example',
      width: 460,
    });

    return (
      <StoryFrame>
        <Button
          label="Open preloaded dialog"
          onClick={() =>
            dialog.show(
              {surface: 'dialog', title: 'Preloaded dialog'},
              {message: 'Dialog content loaded through a Relay EntryPoint.'},
            )
          }
        />
        {dialog.element}
      </StoryFrame>
    );
  },
};

export const Popover: Story = {
  render: () => {
    const popover = usePreloadedPopover(popoverEntryPoint, {
      className: popoverStoryContentRecipe(),
      label: 'Preloaded popover example',
      placement: 'below',
    });

    return (
      <StoryFrame>
        <Button
          {...popover.triggerProps}
          label="Open preloaded popover"
          onClick={() =>
            popover.show(
              {surface: 'popover', title: 'Preloaded popover'},
              {message: 'Popover content loaded through a Relay EntryPoint.'},
            )
          }
          ref={popover.triggerRef}
        />
        {popover.element}
      </StoryFrame>
    );
  },
};

export const PopoverRefreshOnReopen: Story = {
  render: () => {
    const popover = usePreloadedPopover(refreshingPopoverEntryPoint, {
      className: popoverStoryContentRecipe(),
      label: 'Refreshing preloaded popover example',
      placement: 'below',
    });
    const params: DemoParams = {
      surface: 'popover',
      title: 'Refreshing preloaded popover',
    };

    return (
      <StoryFrame>
        <Text as="p" color="secondary">
          Point to or focus the trigger, open the popover, close it, and open it
          again. The load count increases once per opening cycle.
        </Text>
        <Button
          {...popover.triggerProps}
          label="Open refreshing popover"
          onClick={() =>
            popover.show(params, {
              message:
                'A recent intent preload is reused when the popover opens.',
            })
          }
          onFocus={() => popover.preload(params)}
          onPointerEnter={() => popover.preload(params)}
          ref={popover.triggerRef}
        />
        <Button label="Close refreshing popover" onClick={popover.hide} />
        {popover.element}
      </StoryFrame>
    );
  },
};

export const HoverCard: Story = {
  render: () => {
    const hoverCard = usePreloadedHoverCard(hoverCardEntryPoint, {
      delay: 250,
      entryPointParams: {
        surface: 'hover-card',
        title: 'Preloaded hover card',
      },
      label: 'Preloaded hover card example',
      placement: 'below',
      runtimeProps: {
        message: 'Hover card content loaded through a Relay EntryPoint.',
      },
    });

    return (
      <StoryFrame>
        <HStack gap={2}>
          <Text as="span">Point to or focus the trigger:</Text>
          <Button
            {...hoverCard.triggerProps}
            label="Preview account"
            variant="secondary"
          />
        </HStack>
        {hoverCard.element}
      </StoryFrame>
    );
  },
};
