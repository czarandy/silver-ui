import {addons, types, useGlobals} from 'storybook/manager-api';
import {ThemeToggle, type ThemeMode} from './ThemeToggle';

const ADDON_ID = 'silver-ui/theme-toggle';

function ThemeToggleTool(): React.JSX.Element {
  const [globals, updateGlobals] = useGlobals();
  const mode: ThemeMode = globals.theme === 'dark' ? 'dark' : 'light';

  return (
    <ThemeToggle
      mode={mode}
      onToggle={next => {
        updateGlobals({theme: next});
      }}
    />
  );
}

addons.register(ADDON_ID, () => {
  addons.add(`${ADDON_ID}/tool`, {
    match: ({tabId, viewMode}) =>
      !tabId && (viewMode === 'story' || viewMode === 'docs'),
    render: ThemeToggleTool,
    title: 'Toggle dark mode',
    type: types.TOOL,
  });
});
