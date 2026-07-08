// Build-time prerender step. Runs after the client and SSR bundles are built:
// it renders <App /> to a static HTML string and injects it into the built
// index.html's #root, so the served document contains real body content
// (headings, hero copy, links) for crawlers and link unfurlers. The client
// bundle still takes over at runtime for interactivity.
import {readFileSync, rmSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, 'dist');
const serverDir = resolve(dist, 'server');
const indexPath = resolve(dist, 'index.html');
const ROOT_DIV = '<div id="root"></div>';

const {render} = await import(resolve(serverDir, 'entry-server.js'));
const appHtml = render();

const template = readFileSync(indexPath, 'utf-8');
if (!template.includes(ROOT_DIV)) {
  throw new Error(
    `prerender: expected ${ROOT_DIV} in ${indexPath} but it was not found`,
  );
}

const html = template.replace(ROOT_DIV, `<div id="root">${appHtml}</div>`);
writeFileSync(indexPath, html);

// The SSR bundle is a build-time-only artifact; drop it so it is not deployed
// to the static host alongside the client output.
rmSync(serverDir, {recursive: true, force: true});

process.stdout.write(
  `prerender: injected ${appHtml.length} chars into ${indexPath}\n`,
);
