import type {JSX} from 'react';
import {useState} from 'react';
import {Button} from 'silver-ui';

const LINKS = {
  github: 'https://github.com/czarandy/silver-ui',
  npm: 'https://www.npmjs.com/package/silver-ui',
  storybook: 'https://silver-ui-eight.vercel.app/',
};

const INSTALL_CMD = 'npm install silver-ui';

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

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_CMD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable; ignore
    }
  };

  return (
    <div className="install">
      <code className="install__cmd">
        <span className="install__prompt">$</span> {INSTALL_CMD}
      </code>
      <Button
        label={copied ? 'Copied' : 'Copy'}
        onClick={copy}
        size="sm"
        variant="secondary"
      />
    </div>
  );
}

export function App(): JSX.Element {
  return (
    <div className="page">
      <header className="nav">
        <a aria-label="silver-ui home" className="brand" href="/">
          <img
            alt="silver-ui"
            className="brand__wordmark"
            src="/wordmark.svg"
          />
        </a>
        <nav className="nav__links">
          <a href={LINKS.storybook}>Components</a>
          <a href={LINKS.github}>GitHub</a>
          <a href={LINKS.npm}>npm</a>
        </nav>
      </header>

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
          <p className="hero__lede">
            silver-ui gives you a polished, accessible component set with
            CSS-variable theming and dark mode — built on Panda CSS for React
            19.
          </p>

          <InstallCommand />

          <div className="hero__cta">
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
          </div>
        </section>

        <section aria-label="Features" className="features">
          {FEATURES.map(f => (
            <article className="feature" key={f.title}>
              <h2 className="feature__title">{f.title}</h2>
              <p className="feature__body">{f.body}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">
        <span>MIT Licensed</span>
        <nav className="footer__links">
          <a href={LINKS.storybook}>Storybook</a>
          <a href={LINKS.github}>GitHub</a>
          <a href={LINKS.npm}>npm</a>
        </nav>
      </footer>
    </div>
  );
}
