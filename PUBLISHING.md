# Publishing silver-ui to npm

Releases use a **two-stage flow**:

1. **Locally**, `pnpm release` (which runs [`scripts/release.sh`](scripts/release.sh))
   cuts the release — runs checks, builds, bumps the version, creates the git
   commit + tag, pushes, and creates a GitHub Release.
2. **In CI**, the [`publish.yml`](.github/workflows/publish.yml) workflow fires
   on the published release and runs `npm publish` from a clean runner.

CI authenticates to npm with [OIDC **trusted publishing**](https://docs.npmjs.com/trusted-publishers) —
**there is no npm token anywhere**, nothing to rotate, and nothing to expire.
npm verifies the publish request came from this repo's `publish.yml` workflow
and mints a short-lived credential. Every published version also gets an
automatic, verified [provenance](https://docs.npmjs.com/generating-provenance-statements)
badge linking it back to the exact commit and build.

## Prerequisites

- Node.js >= 22
- pnpm (`corepack enable` to use the version pinned in `package.json`)
- [GitHub CLI](https://cli.github.com/) (`gh`), authenticated via `gh auth login`
- Push access to the repo (cutting a release requires no npm credentials locally —
  CI publishes via the configured trusted publisher)

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
- upgrades to npm `>= 11.5.1` (required for OIDC; newer than the npm bundled with
  Node 22);
- publishes with `--access public` over OIDC, adding `--tag next` for
  pre-releases. Auth and provenance are automatic — no token.

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

- **CI publish failed with `E403` / "you do not have permission" or an OIDC
  auth error** — the trusted publisher config on npm doesn't match this run.
  Confirm the org (`czarandy`), repo (`silver-ui`), and workflow filename
  (`publish.yml`) on the package's **Settings → Trusted Publisher** page exactly
  match, and that the job has `permissions: id-token: write`.
- **`npm error Unsupported OIDC` / auth ignored** — the runner's npm is older
  than 11.5.1. The workflow upgrades npm before publishing; make sure that step
  is present.
- **`E409` / "cannot publish over previously published version"** — the version
  in `package.json` already exists on npm. Cut a new release; npm versions are
  immutable.
- **Provenance step fails** — confirm the workflow has `permissions: id-token:
write` (it does) and that the release was published, not just drafted.
- **The release was created but CI didn't run** — CI triggers on `published`,
  not `draft`. Publish the draft release to fire it.
