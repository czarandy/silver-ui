import {useState, type JSX} from 'react';
import {
  Alert,
  AppShell,
  Badge,
  Button,
  Card,
  CodeBlock,
  DateInput,
  Divider,
  DropdownMenu,
  HStack,
  Icon,
  Link,
  type PlainDate,
  Progress,
  SearchFilterInput,
  type SearchFilterInputFilter,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  Slider,
  Switch,
  Tag,
  Text,
  TextInput,
  Theme,
  type ThemePresetName,
  themePresets,
  TopNav,
  TopNavHeading,
  TopNavItem,
  useAppShellMobile,
  useSearchFilterInputConfig,
  VStack,
} from 'silver-ui';
import {
  Archive,
  Bell,
  Circle,
  Edit,
  Moon,
  Search,
  Sun,
  Trash2,
} from 'lucide-react';

const LINKS = {
  github: 'https://github.com/czarandy/silver-ui',
  npm: 'https://www.npmjs.com/package/silver-ui',
  storybook: 'https://storybook.silver-ui.com/',
};

const INSTALL_CMD = 'npm install silver-ui';

const FEATURES = [
  {
    title: 'Themeable',
    body: 'Every color, radius, and spacing token is a CSS variable. Re-skin the whole library by simply overriding variables.',
  },
  {
    title: 'Light & dark mode',
    body: 'First-class dark mode baked into the theme layer, with a flash-free pattern for setting the theme before paint.',
  },
  {
    title: 'Built on Panda CSS',
    body: 'Zero-runtime, type-safe styles compiled to one small atomic stylesheet.',
  },
  {
    title: 'React 19',
    body: 'Authored for React 19 with modern refs, React compiler in mind, and fully typed component APIs.',
  },
  {
    title: 'Accessible',
    body: 'Keyboard navigation, focus rings, and ARIA wiring come standard on every interactive component.',
  },
  {
    title: 'Tree-shakeable',
    body: "Import the whole library or a single component subpath. Bundlers drop everything you don't use.",
  },
];

const THEME_OPTIONS: Array<{label: string; value: string}> = [
  {label: 'Default', value: 'default'},
  ...Object.entries(themePresets).map(([key, preset]) => ({
    label: preset.label,
    value: key,
  })),
];

const SEARCH_FIELDS = [
  {key: 'name', label: 'Name', type: 'string' as const},
  {
    key: 'status',
    label: 'Status',
    type: 'enum' as const,
    enumValues: [
      {label: 'Active', value: 'active'},
      {label: 'Pending', value: 'pending'},
      {label: 'Archived', value: 'archived'},
    ],
  },
  {key: 'priority', label: 'Priority', type: 'number' as const},
];

const DROPDOWN_ITEMS = [
  {icon: Edit, label: 'Edit'},
  {icon: Archive, label: 'Archive'},
  {type: 'divider' as const},
  {icon: Trash2, label: 'Delete'},
];

function ComponentShowcase(): JSX.Element {
  const [switchValue, setSwitchValue] = useState(true);
  const [sliderValue, setSliderValue] = useState(40);
  const [dateValue, setDateValue] = useState<PlainDate | null>(null);
  const [filters, setFilters] = useState<
    ReadonlyArray<SearchFilterInputFilter>
  >([
    {
      field: 'status',
      operator: 'is',
      value: {type: 'enum', value: 'active'},
    },
  ]);
  const {config} = useSearchFilterInputConfig(SEARCH_FIELDS);

  return (
    <VStack gap={5}>
      <VStack gap={1}>
        <Text as="div" type="large" weight="semibold">
          Component showcase
        </Text>
        <Text as="p" color="secondary" type="body">
          A scoped theme updates Silver UI tokens for every component below.
        </Text>
      </VStack>

      <Alert
        description="Alerts, buttons, inputs, badges, and toggles all resolve through semantic tokens."
        status="info"
        title="Theme preview"
      />

      <HStack align="end" gap={4} wrap="wrap">
        <TextInput
          hasClear
          label="Project"
          onChange={() => {}}
          placeholder="Search projects"
          startIcon={Search}
          value="Apollo"
        />
        <Switch
          description="Use themed semantic tokens for interactive controls."
          isSelected={switchValue}
          label="Notifications"
          labelIcon={Bell}
          onChange={setSwitchValue}
        />
      </HStack>

      <HStack align="end" gap={4} wrap="wrap">
        <DateInput label="Due date" onChange={setDateValue} value={dateValue} />
        <DropdownMenu button={{label: 'Actions'}} items={DROPDOWN_ITEMS} />
      </HStack>

      <SearchFilterInput
        config={config}
        filters={filters}
        onChange={setFilters}
        placeholder="Filter by name, status, or priority…"
      />

      <HStack gap={2} wrap="wrap">
        <Badge color="neutral" label="Neutral" size="lg" />
        <Badge color="success" label="Ready" size="lg" />
        <Badge color="warning" label="Review" size="lg" />
        <Badge color="error" label="Blocked" size="lg" />
      </HStack>

      <Slider
        label="Volume"
        onChange={setSliderValue}
        value={sliderValue}
        valueDisplay="text"
      />

      <Progress
        hasValueLabel
        isLabelHidden
        label="Upload progress"
        value={65}
      />

      <HStack gap={2} wrap="wrap">
        <Tag color="blue" label="React" />
        <Tag color="teal" label="TypeScript" />
        <Tag color="purple" label="Panda CSS" />
        <Tag color="orange" label="Accessible" />
      </HStack>

      <HStack gap={3}>
        <Button label="Save changes" variant="primary" />
        <Button label="Cancel" variant="secondary" />
        <Button label="Delete" variant="destructive" />
      </HStack>
    </VStack>
  );
}

/**
 * Theme preset picker. Renders a SegmentedControl on desktop and swaps to a
 * Select dropdown on mobile, where five segments would overflow the panel.
 * Relies on AppShell's mobile context, so it must render inside AppShell.
 */
function ThemeSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}): JSX.Element {
  const {isMobile} = useAppShellMobile();

  if (isMobile) {
    return (
      <Select
        className="showcase__control"
        label="Theme preset"
        onChange={next => onChange(next ?? 'default')}
        options={THEME_OPTIONS}
        value={value}
      />
    );
  }

  return (
    <SegmentedControl
      className="showcase__control"
      label="Theme preset"
      onChange={onChange}
      value={value}>
      {THEME_OPTIONS.map(opt => (
        <SegmentedControlItem
          key={opt.value}
          label={opt.label}
          value={opt.value}
        />
      ))}
    </SegmentedControl>
  );
}

export function App(): JSX.Element {
  const [mode, setMode] = useState<'dark' | 'light'>('light');
  const [selectedTheme, setSelectedTheme] = useState('default');

  const preset =
    selectedTheme === 'default'
      ? undefined
      : themePresets[selectedTheme as ThemePresetName];

  return (
    <Theme className="page" mode={mode}>
      <AppShell
        contentPadding={0}
        height="auto"
        mobileBreakpoint="sm"
        topNav={
          <TopNav
            className="site-nav"
            endContent={
              <TopNavItem
                href="#"
                icon={mode === 'dark' ? Sun : Moon}
                isIconOnly
                label="Toggle dark mode"
                onClick={e => {
                  e.preventDefault();
                  setMode(prev => (prev === 'dark' ? 'light' : 'dark'));
                }}
              />
            }
            heading={
              <TopNavHeading
                aria-label="silver-ui home"
                href="/"
                logo={
                  <img
                    alt="silver-ui"
                    className="brand__wordmark"
                    height={417}
                    src="/wordmark.svg"
                    width={1700}
                  />
                }
              />
            }
            label="Main navigation"
            startContent={
              <>
                <TopNavItem href={LINKS.storybook} label="Components" />
                <TopNavItem href={LINKS.github} label="GitHub" />
                <TopNavItem href={LINKS.npm} label="npm" />
              </>
            }
          />
        }
        variant="section">
        <section className="hero">
          <h1 className="hero__title">
            A themeable React
            <br />
            component library
          </h1>
          <Text as="p" className="hero__lede" color="secondary" type="large">
            silver-ui has 70+ fast and accessible components with support for
            theming and dark mode to help you build polished web apps.
          </Text>

          <div className="hero__install">
            <CodeBlock
              code={INSTALL_CMD}
              container="inline"
              label="Install silver-ui"
            />
          </div>

          <HStack
            align="center"
            className="hero__cta"
            gap={3}
            justify="center"
            wrap="wrap">
            <Button
              href={LINKS.storybook}
              label="Browse components"
              size="lg"
              variant="primary"
            />
            <Button
              href={LINKS.github}
              label="View on GitHub"
              size="lg"
              variant="secondary"
            />
          </HStack>
        </section>

        <section aria-label="Features" className="features">
          {FEATURES.map(f => (
            <Card className="feature" key={f.title} padding={6}>
              <h2 className="feature__title">
                <Icon
                  color="accent"
                  icon={Circle}
                  size="sm"
                  style={{
                    fill: 'currentColor',
                    flexShrink: 0,
                    height: 10,
                    width: 10,
                  }}
                />
                {f.title}
              </h2>
              <Text as="p" color="secondary">
                {f.body}
              </Text>
            </Card>
          ))}
        </section>

        <section aria-label="Theme showcase" className="showcase">
          <h2 className="showcase__heading">Theme customization</h2>

          <Theme themes={preset?.themes} tokens={preset?.tokens}>
            <Card className="showcase__panel" padding={6}>
              <ThemeSelector
                onChange={setSelectedTheme}
                value={selectedTheme}
              />
              <ComponentShowcase />
            </Card>
          </Theme>
        </section>
      </AppShell>

      <Divider className="page__divider" />
      <footer className="footer">
        <HStack align="center" gap={2}>
          <Badge color="neutral" label="MIT" size="sm" />
          <Text color="secondary">Licensed</Text>
        </HStack>
        <Text color="secondary">
          Created by{' '}
          <Link href="https://github.com/czarandy">Andrey Goder</Link>
        </Text>
      </footer>
    </Theme>
  );
}
