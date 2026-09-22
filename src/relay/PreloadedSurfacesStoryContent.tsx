'use client';

import type {EntryPointProps} from 'react-relay';
import {Button} from 'components/Button';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from 'components/Layout';
import {VStack} from 'components/Stack';
import {Text} from 'components/Text';
import {cva} from 'styled-system/css';

export interface PreloadedSurfaceStoryRuntimeProps {
  close: () => void;
  message: string;
}

export type PreloadedSurfaceStoryEntryPointProps = EntryPointProps<
  Record<string, never>,
  Record<string, never>,
  PreloadedSurfaceStoryRuntimeProps,
  {
    surface: 'dialog' | 'drawer' | 'hover-card' | 'popover';
    title: string;
  }
>;

const hoverCardContentRecipe = cva({
  base: {
    maxW: '260px',
  },
});

export default function PreloadedSurfacesStoryContent({
  extraProps,
  props,
}: PreloadedSurfaceStoryEntryPointProps): React.JSX.Element {
  if (extraProps.surface === 'hover-card') {
    return (
      <VStack className={hoverCardContentRecipe()} gap={1}>
        <Text as="p" type="label">
          {extraProps.title}
        </Text>
        <Text as="p" color="secondary">
          {props.message}
        </Text>
      </VStack>
    );
  }

  const isPopover = extraProps.surface === 'popover';

  return (
    <Layout
      content={
        <LayoutContent>
          <VStack gap={3}>
            <Text as="p" color="secondary">
              {props.message}
            </Text>
            <Text as="p">
              The EntryPoint module has finished loading. Reload the story to
              replay the intentional delay.
            </Text>
          </VStack>
        </LayoutContent>
      }
      footer={
        isPopover ? null : (
          <LayoutFooter
            primaryButton={
              <Button label="Done" onClick={props.close} variant="primary" />
            }
            secondaryButton={<Button label="Cancel" onClick={props.close} />}
          />
        )
      }
      header={
        <LayoutHeader
          subtitle="Loaded through a Relay EntryPoint"
          title={extraProps.title}
        />
      }
      height={isPopover ? 'auto' : 'fill'}
    />
  );
}
