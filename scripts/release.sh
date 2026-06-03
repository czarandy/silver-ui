#!/usr/bin/env bash
#
# release.sh — interactive npm release for silver-ui.
#
# Walks through the steps documented in PUBLISHING.md:
#   preflight checks -> typecheck/test/lint -> build -> verify tarball ->
#   version bump (commit + tag) -> npm publish -> git push --follow-tags
#
# Usage:
#   scripts/release.sh                 # prompts for the release type
#   scripts/release.sh patch           # skip the type prompt
#   scripts/release.sh minor --yes     # also skip confirmation prompts
#   scripts/release.sh prerelease      # tags as 1.0.1-beta.0 and publishes to the "beta" dist-tag
#   scripts/release.sh patch --otp=123456   # pass a 2FA one-time code to npm publish
#   scripts/release.sh --dry-run       # run every check + build but do NOT bump/publish/push
#
set -euo pipefail

# --- locate repo root so the script works from anywhere ---------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

# --- pretty output ----------------------------------------------------------
bold() { printf '\033[1m%s\033[0m\n' "$1"; }
info() { printf '\033[36m›\033[0m %s\n' "$1"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

# --- parse args -------------------------------------------------------------
RELEASE_TYPE=""
ASSUME_YES=0
DRY_RUN=0
OTP=""
PREID="beta"

for arg in "$@"; do
  case "$arg" in
    patch|minor|major|prerelease|premajor|preminor|prepatch) RELEASE_TYPE="$arg" ;;
    --yes|-y)        ASSUME_YES=1 ;;
    --dry-run)       DRY_RUN=1 ;;
    --otp=*)         OTP="${arg#*=}" ;;
    --preid=*)       PREID="${arg#*=}" ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

confirm() {
  # confirm "message"  -> returns 0 if yes
  [ "$ASSUME_YES" -eq 1 ] && return 0
  local reply
  printf '\033[33m?\033[0m %s [y/N] ' "$1"
  read -r reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

# --- preflight --------------------------------------------------------------
bold "silver-ui release"
echo

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a git repository."

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  warn "You are on branch '$BRANCH', not 'main'."
  confirm "Continue releasing from '$BRANCH'?" || die "Aborted."
fi

# Working tree must be clean: npm version refuses to run otherwise, and a clean
# tree guarantees we publish exactly what is committed. dist/ is gitignored, so
# building later will not dirty it.
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  die "Working tree is not clean. Commit or stash changes first."
fi
ok "Working tree clean (branch: $BRANCH)"

# npm auth
if ! NPM_USER="$(npm whoami 2>/dev/null)"; then
  die "Not logged in to npm. Run 'npm login' first."
fi
ok "Authenticated to npm as: $NPM_USER"

PKG_NAME="$(node -p "require('./package.json').name")"
CUR_VERSION="$(node -p "require('./package.json').version")"
info "Package: $PKG_NAME @ $CUR_VERSION"

# Scoped packages default to restricted access; publish them as public unless
# package.json already declares publishConfig.access.
PUBLISH_ACCESS_FLAG=""
if [[ "$PKG_NAME" == @*/* ]]; then
  HAS_ACCESS="$(node -p "require('./package.json').publishConfig?.access || ''")"
  if [ -z "$HAS_ACCESS" ]; then
    PUBLISH_ACCESS_FLAG="--access public"
    info "Scoped package without publishConfig.access — will publish with --access public"
  fi
fi

# Warn if this version is already on npm (republishing a version is rejected).
if npm view "${PKG_NAME}@${CUR_VERSION}" version >/dev/null 2>&1; then
  warn "${PKG_NAME}@${CUR_VERSION} is already published. The version bump below will move past it."
fi

echo

# --- choose release type ----------------------------------------------------
if [ -z "$RELEASE_TYPE" ]; then
  bold "What kind of release is this?"
  echo "  1) patch       — bug fixes              (1.0.0 → 1.0.1)"
  echo "  2) minor       — new, backward-compat   (1.0.0 → 1.1.0)"
  echo "  3) major       — breaking changes       (1.0.0 → 2.0.0)"
  echo "  4) prerelease  — pre-release tag        (1.0.0 → 1.0.1-${PREID}.0)"
  printf '\033[33m?\033[0m Select 1-4: '
  read -r choice
  case "$choice" in
    1) RELEASE_TYPE="patch" ;;
    2) RELEASE_TYPE="minor" ;;
    3) RELEASE_TYPE="major" ;;
    4) RELEASE_TYPE="prerelease" ;;
    *) die "Invalid selection: $choice" ;;
  esac
fi

# Preview the next version. Only the stable bumps are previewed in bash; npm
# computes and prints the real value when it runs, so this is just a heads-up.
# Strips any existing pre-release/build suffix before computing.
BASE="${CUR_VERSION%%-*}"
IFS='.' read -r MAJ MIN PAT <<<"$BASE"
case "$RELEASE_TYPE" in
  patch) NEXT_VERSION="$MAJ.$MIN.$((PAT + 1))" ;;
  minor) NEXT_VERSION="$MAJ.$((MIN + 1)).0" ;;
  major) NEXT_VERSION="$((MAJ + 1)).0.0" ;;
  *)     NEXT_VERSION="" ;;  # prerelease shapes vary; let npm print the result
esac
if [ -n "$NEXT_VERSION" ]; then
  ok "Release type: $RELEASE_TYPE  ($CUR_VERSION → $NEXT_VERSION)"
else
  ok "Release type: $RELEASE_TYPE  (next version computed by npm)"
fi

# prereleases go to a dedicated dist-tag so they are not installed by default.
NPM_TAG_FLAG=""
case "$RELEASE_TYPE" in
  pre*) NPM_TAG_FLAG="--tag $PREID" ;;
esac

echo
confirm "Proceed with checks and build?" || die "Aborted."

# --- quality gates ----------------------------------------------------------
bold "Running checks"
info "typecheck"; pnpm typecheck
info "test";      pnpm test
info "lint";      pnpm lint
ok "Checks passed"

bold "Building"
pnpm build
ok "Build complete"

info "Validating package exports (publint)"
pnpm exec publint
ok "publint passed"

bold "Tarball contents"
pnpm pack --dry-run
echo
confirm "Does the tarball look correct?" || die "Aborted."

# --- stop here for dry runs -------------------------------------------------
if [ "$DRY_RUN" -eq 1 ]; then
  echo
  ok "Dry run complete — no version bump, publish, or push performed."
  exit 0
fi

# --- the irreversible part --------------------------------------------------
echo
bold "Ready to release ${PKG_NAME} (${RELEASE_TYPE})"
warn "This will: bump the version, create a git commit + tag, publish to npm, and push to origin."
confirm "Publish for real?" || die "Aborted before publishing."

# 1. Version bump — updates package.json, commits, and creates a tag.
if [[ "$RELEASE_TYPE" == pre* ]]; then
  NEW_VERSION="$(npm version "$RELEASE_TYPE" --preid="$PREID")"
else
  NEW_VERSION="$(npm version "$RELEASE_TYPE")"
fi
ok "Bumped to $NEW_VERSION (commit + tag created)"

# 2. Publish. Roll back the tag/commit if publish fails so we can retry cleanly.
OTP_FLAG=""
[ -n "$OTP" ] && OTP_FLAG="--otp=$OTP"

# shellcheck disable=SC2086
if ! npm publish $PUBLISH_ACCESS_FLAG $NPM_TAG_FLAG $OTP_FLAG; then
  warn "npm publish failed. Rolling back the version commit and tag."
  git tag -d "$NEW_VERSION" 2>/dev/null || true
  git reset --hard HEAD~1
  die "Publish failed — repository restored to pre-bump state. Fix the issue and re-run."
fi
ok "Published ${PKG_NAME}@${NEW_VERSION#v} to npm"

# 3. Push commit + tag.
info "Pushing commit and tag to origin"
git push --follow-tags
ok "Pushed to origin"

echo
bold "🎉 Release complete: ${PKG_NAME}@${NEW_VERSION#v}"
[ -n "$NPM_TAG_FLAG" ] && info "Published under dist-tag '$PREID'. Install with: npm install ${PKG_NAME}@${PREID}"
