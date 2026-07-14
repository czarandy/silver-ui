import {describe, expect, it} from 'vitest';
import chatComposerMeta from 'components/Chat/ChatComposer.stories';
import chatLayoutMeta from 'components/Chat/ChatLayout.stories';
import chatMessageMeta from 'components/Chat/ChatMessage.stories';

describe('Chat Storybook titles', () => {
  it('includes Chat in each focused component name for search', () => {
    expect([
      chatComposerMeta.title,
      chatLayoutMeta.title,
      chatMessageMeta.title,
    ]).toEqual([
      'Components/Chat/Chat Composer',
      'Components/Chat/Chat Layout',
      'Components/Chat/Chat Message',
    ]);
  });
});
