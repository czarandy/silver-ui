'use client';

import type {EntryPointProps} from 'react-relay';
import {Button} from 'components/Button';
import {VStack} from 'components/Stack';
import {Heading, Text} from 'components/Text';

export interface PreloadedSurfaceStoryRuntimeProps {
  close: () => void;
  message: string;
}

export type PreloadedSurfaceStoryEntryPointProps = EntryPointProps<
  Record<string, never>,
  Record<string, never>,
  PreloadedSurfaceStoryRuntimeProps,
  {title: string}
>;

export default function PreloadedSurfacesStoryContent({
  extraProps,
  props,
}: PreloadedSurfaceStoryEntryPointProps): React.JSX.Element {
  return (
    <VStack gap={4} style={{maxWidth: 360, padding: 24}}>
      <VStack gap={1}>
        <Heading level={2}>{extraProps.title}</Heading>
        <Text as="p" color="secondary">
          {props.message}
        </Text>
      </VStack>
      <Text as="p">
        The EntryPoint module has finished loading. Reload the story to replay
        the intentional delay.
      </Text>
      <Button label="Close" onClick={props.close} variant="primary" />
    </VStack>
  );
}
