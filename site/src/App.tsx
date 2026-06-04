import type {JSX} from 'react';
import {
  Badge,
  Button,
  Card,
  CodeBlock,
  Divider,
  HStack,
  Link,
  Text,
  TopNav,
  TopNavHeading,
  TopNavItem,
} from 'silver-ui';

const LINKS = {
  github: 'https://github.com/czarandy/silver-ui',
  npm: 'https://www.npmjs.com/package/silver-ui',
  storybook: 'https://storybook.silver-ui.com/',
};

const INSTALL_CMD = 'npm install silver-ui';

const TAGS = ['React 19', 'Panda CSS', 'Dark mode', 'Tree-shakeable'];

const FEATURES = [
  {
    title: 'Themeable',
    body: 'Every color, radius, and spacing token is a CSS variable. Re-skin the whole library by overriding variables — no rebuild required.',
  },
  {
    title: 'Light & dark mode',
    body: 'First-class dark mode baked into the theme layer, with a flash-free pattern for setting the theme before paint.',
  },
  {
    title: 'Built on Panda CSS',
    body: 'Zero-runtime, type-safe styles compiled to static CSS. You ship the styles you use and nothing more.',
  },
  {
    title: 'React 19 ready',
    body: 'Authored for React 19 with modern refs, the compiler in mind, and fully typed component APIs.',
  },
  {
    title: 'Accessible by default',
    body: 'Keyboard navigation, focus rings, and ARIA wiring come standard on every interactive component.',
  },
  {
    title: 'Tree-shakeable',
    body: 'Import the whole library or a single component subpath. Bundlers drop everything you do not use.',
  },
];

export function App(): JSX.Element {
  return (
    <div className="page">
      <TopNav
        endContent={
          <>
            <TopNavItem href={LINKS.storybook} label="Components" />
            <TopNavItem href={LINKS.github} label="GitHub" />
            <TopNavItem href={LINKS.npm} label="npm" />
          </>
        }
        heading={
          <TopNavHeading
            aria-label="silver-ui home"
            href="/"
            logo={
              <img
                alt="silver-ui"
                className="brand__wordmark"
                src="/wordmark.svg"
              />
            }
          />
        }
        label="Main navigation"
      />

      <main>
        <section className="hero">
          <img
            alt=""
            className="hero__mark"
            height={88}
            src="/logo.svg"
            width={88}
          />
          <h1 className="hero__title">
            A themeable React
            <br />
            component library
          </h1>
          <Text as="p" className="hero__lede" color="secondary" type="large">
            silver-ui gives you a polished, accessible component set with
            CSS-variable theming and dark mode — built on Panda CSS for React
            19.
          </Text>

          <HStack
            align="center"
            className="hero__tags"
            gap={2}
            justify="center"
            wrap="wrap">
            {TAGS.map(tag => (
              <Badge color="neutral" key={tag} label={tag} size="md" />
            ))}
          </HStack>

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
              <h2 className="feature__title">{f.title}</h2>
              <Text as="p" color="secondary">
                {f.body}
              </Text>
            </Card>
          ))}
        </section>
      </main>

      <Divider className="page__divider" />
      <footer className="footer">
        <HStack align="center" gap={2}>
          <Badge color="neutral" label="MIT" size="sm" />
          <Text color="secondary" size="sm">
            Licensed
          </Text>
        </HStack>
        <HStack gap={5}>
          <Link color="secondary" href={LINKS.storybook}>
            Storybook
          </Link>
          <Link color="secondary" href={LINKS.github}>
            GitHub
          </Link>
          <Link color="secondary" href={LINKS.npm}>
            npm
          </Link>
        </HStack>
      </footer>
    </div>
  );
}
