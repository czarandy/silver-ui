/**
 * Destinations the site links to, and the header nav in the order both headers
 * render it.
 *
 * The landing nav (`landing/App.tsx`) and the docs nav (`components/
 * SocialIcons.astro`, which overrides the slot Starlight puts beside the theme
 * toggle) both read this list, so neither can drift from the other.
 */
export const LINKS = {
  components: '/components/',
  docs: '/getting-started/',
  github: 'https://github.com/czarandy/silver-ui',
  npm: 'https://www.npmjs.com/package/silver-ui',
} as const;

export interface NavLink {
  /**
   * Destination of the link.
   */
  href: string;
  /**
   * Text shown in the header.
   */
  label: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  {href: LINKS.docs, label: 'Docs'},
  {href: LINKS.components, label: 'Components'},
  {href: LINKS.github, label: 'GitHub'},
  {href: LINKS.npm, label: 'npm'},
];
