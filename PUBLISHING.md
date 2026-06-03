# Publishing silver-ui to npm

Releases use a **two-stage flow**:

1. **Locally**, `pnpm release` (which runs [`scripts/release.sh`](scripts/release.sh))
   cuts the release — runs checks, builds, bumps the version, creates the git
   commit + tag, pushes, and creates a GitHub Release.
2. **In CI**, the [`publish.yml`](.github/workflows/publish.yml) workflow fires
   on the published release and runs `npm publish --provenance` from a clean
   runner.

The npm token lives only as a GitHub secret — never on a developer machine — and
every published version gets a verified [provenance](https://docs.npmjs.com/generating-provenance-statements)
badge linking it back to the exact commit and build.

## Prerequisites

- Node.js >= 22
- pnpm (`corepack enable` to use the version pinned in `package.json`)
- [GitHub CLI](https://cli.github.com/) (`gh`), authenticated via `gh auth login`
- An npm account ([npmjs.com/signup](https://www.npmjs.com/signup)) with publish
  rights to the package

## One-time setup

### 1. Confirm the package name is available

The current name in `package.json` is `silver-ui`. Check it:

```bash
npm view silver-ui
```

If the name is taken, scope it under your npm username (e.g.
`@yourusername/silver-ui`) by updating the `"name"` field in `package.json`.
The publish workflow already passes `--access public`, so scoped packages
publish publicly without extra config.

### 2. Create an npm access token

Generate a **Granular Access Token** at
[npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens), scoped
with read/write to this package (and the "Packages and scopes" permission).

### 3. Add it as a GitHub secret

In the GitHub repo, go to **Settings → Secrets and variables → Actions → New
repository secret** and add it as:

- Name: `NPM_TOKEN`
- Value: the token from step 2

That's the only secret CI needs. Provenance uses GitHub's OIDC
(`id-token: write`), which the workflow already requests — no extra token.

## Cutting a release

From a clean `main` with everything committed and pushed:

```bash
pnpm release
```

The script will:

1. **Preflight** — verify `gh` is authenticated, you're on `main`, the working
   tree is clean, and local `main` hasn't diverged from origin.
2. **Prompt for the release type**, showing the resulting version computed from
   the current one:

   ```
   What kind of release is this?  (current: 0.1.0)
     1) patch       — bug fixes              (0.1.0 → 0.1.1)
     2) minor       — new, backward-compat   (0.1.0 → 0.2.0)
     3) major       — breaking changes       (0.1.0 → 1.0.0)
     4) prerelease  — pre-release tag        (0.1.0 → 0.1.1-beta.0)
   ```

3. **Run the gates** — `typecheck`, `test`, `lint`, `build`, `publint`, and
   `pnpm pack --dry-run` (so you can eyeball the tarball contents).
4. **Bump + tag** — `npm version` updates `package.json` and creates the
   `vX.Y.Z` commit and tag.
5. **Push** the commit and tag to origin (rolls the bump back locally if the
   push fails).
6. **Create the GitHub Release**, which triggers `publish.yml`.

Then watch CI do the publish:

```bash
gh run watch        # or: gh run list --workflow=publish.yml
```

### Non-interactive / flags

```bash
pnpm release patch              # skip the type prompt
pnpm release minor --yes        # also skip confirmation prompts
pnpm release prerelease         # cut 0.1.1-beta.0 (CI publishes to the 'next' dist-tag)
pnpm release patch --preid=rc   # use a different pre-release identifier
pnpm release --dry-run          # run all checks + build, but do NOT bump/tag/push/release
```

> **First release note:** `package.json` is at `0.1.0`. Picking `patch` makes the
> first published version `0.1.1`. If you want `0.1.0` itself to be the first
> release, set `RELEASE_TYPE` accordingly — or temporarily create the tag/release
> at `v0.1.0` by hand. After the first publish, `pnpm release` handles everything.

## Pre-releases

Choosing `prerelease` (or passing it as an argument) produces a version like
`0.1.1-beta.0` and marks the GitHub Release as a pre-release. CI detects that and
publishes under the **`next`** dist-tag instead of `latest`, so a plain
`npm install silver-ui` never picks it up. Consumers opt in explicitly:

```bash
npm install silver-ui@next
```

## How CI decides what to publish

`publish.yml` runs on `release: published` and:

- reinstalls with `--frozen-lockfile` and re-runs `typecheck`, `test`, `lint`,
  `build`, and `publint` on a clean checkout;
- **verifies the release tag matches `package.json`'s version**, so a mistagged
  release can't publish the wrong thing;
- publishes with `--provenance --access public`, adding `--tag next` for
  pre-releases.

## Consuming the published package

```bash
npm install silver-ui
```

```tsx
import {Button} from 'silver-ui';
import 'silver-ui/styles.css';
```

Or import individual components for better tree-shaking:

```tsx
import {Button} from 'silver-ui/Button';
```

## Troubleshooting

- **CI publish failed with `E403` / "you do not have permission"** — the
  `NPM_TOKEN` secret is missing, expired, or lacks write access to the package.
- **`E409` / "cannot publish over previously published version"** — the version
  in `package.json` already exists on npm. Cut a new release; npm versions are
  immutable.
- **Provenance step fails** — confirm the workflow has `permissions: id-token:
write` (it does) and that the release was published, not just drafted.
- **The release was created but CI didn't run** — CI triggers on `published`,
  not `draft`. Publish the draft release to fire it.
