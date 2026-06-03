# Publishing silver-ui to npm

## Prerequisites

- Node.js >= 22
- pnpm (`corepack enable` to use the version pinned in `package.json`)
- An npm account ([npmjs.com/signup](https://www.npmjs.com/signup))

## One-time setup

### 1. Log in to npm

```bash
npm login
```

This stores an auth token in `~/.npmrc`.

### 2. Choose a package name

The current name in `package.json` is `silver-ui`. Check if it's available:

```bash
npm view silver-ui
```

If the name is taken, either:

- Scope it under your npm username (e.g. `@yourusername/silver-ui`) by updating the `"name"` field in `package.json`.
- Pick a different name.

If you use a scope, you need to set access to public (scoped packages default to restricted):

```bash
npm publish --access public
```

Or add this to `package.json`:

```json
"publishConfig": {
  "access": "public"
}
```

### 3. Verify package contents

Before publishing, check what will be included in the tarball:

```bash
pnpm pack --dry-run
```

The `"files"` field in `package.json` already limits it to the `dist/` directory. Make sure there's nothing unexpected and that `dist/` contains the built output.

## Publishing

### 1. Build the package

```bash
pnpm build
```

This runs Panda CSS codegen, tsup bundling, TypeScript declaration generation, and CSS extraction.

### 2. Run checks

```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm check:exports    # runs publint to validate package exports
```

### 3. Bump the version

Use npm's built-in version command. This updates `package.json` and creates a git tag:

```bash
# Patch release (0.1.0 → 0.1.1)
npm version patch

# Minor release (0.1.0 → 0.2.0)
npm version minor

# Major release (0.1.0 → 1.0.0)
npm version major
```

For pre-releases:

```bash
npm version prerelease --preid=beta   # 0.1.0 → 0.1.1-beta.0
```

### 4. Publish

```bash
npm publish
```

Or for scoped packages without `publishConfig`:

```bash
npm publish --access public
```

### 5. Push the version tag

```bash
git push --follow-tags
```

## Automating with GitHub Actions (optional)

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm test
      - run: pnpm check:exports
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

To set this up:

1. Generate an npm access token at [npmjs.com/settings/tokens](https://www.npmjs.com/settings/~/tokens) — use a "Granular Access Token" scoped to the package.
2. Add it as a repository secret named `NPM_TOKEN` in GitHub under **Settings > Secrets and variables > Actions**.
3. Create a release on GitHub to trigger the workflow. The `--provenance` flag links the published package to its source and build, which npm displays as a verified badge.

## Consuming the published package

After publishing, consumers install and use it like:

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
