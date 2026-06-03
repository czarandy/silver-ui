#!/usr/bin/env bash
#
# release.sh — interactive release driver for silver-ui.
#
# This is the LOCAL half of a two-stage release:
#   1. (here) preflight -> checks -> build -> bump version -> tag -> push ->
#      create a GitHub Release.
#   2. (CI) .github/workflows/publish.yml runs on the published release and does
#      the actual `npm publish` from a clean runner, authenticating via OIDC
#      "trusted publishing" — no npm token anywhere. The package gets an
#      automatic, verified provenance badge.
#
# So this script never publishes to npm itself — it cuts the release that CI
# publishes. The local checks/build are a fast-fail gate; CI re-runs them.
#
# Usage:
#   scripts/release.sh                 # prompts for the release type
#   scripts/release.sh patch           # skip the type prompt
#   scripts/release.sh minor --yes     # also skip confirmation prompts
#   scripts/release.sh prerelease      # cuts a 0.1.1-beta.0 pre-release (CI publishes to the "next" dist-tag)
#   scripts/release.sh --dry-run       # run every check + build but do NOT bump/tag/push/release
#   scripts/release.sh patch --preid=rc # use a different pre-release identifier
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
PREID="beta"

for arg in "$@"; do
  case "$arg" in
    patch|minor|major|prerelease|premajor|preminor|prepatch) RELEASE_TYPE="$arg" ;;
    --yes|-y)        ASSUME_YES=1 ;;
    --dry-run)       DRY_RUN=1 ;;
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

command -v gh >/dev/null 2>&1 || die "GitHub CLI ('gh') not found. Install it: https://cli.github.com/"
git rev-parse --is-inside-work-tree >/dev/null 2>&1 || die "Not inside a git repository."

# CI publishes via a GitHub Release, so we need gh auth — not npm auth — locally.
gh auth status >/dev/null 2>&1 || die "Not logged in to GitHub CLI. Run 'gh auth login' first."
ok "Authenticated to GitHub CLI"

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "main" ]; then
  warn "You are on branch '$BRANCH', not 'main'."
  confirm "Continue releasing from '$BRANCH'?" || die "Aborted."
fi

# Working tree must be clean: npm version refuses to run otherwise, and a clean
# tree guarantees CI publishes exactly what is committed. dist/ is gitignored,
# so building later will not dirty it.
if [ -n "$(git status --porcelain)" ]; then
  git status --short
  die "Working tree is not clean. Commit or stash changes first."
fi
ok "Working tree clean (branch: $BRANCH)"

# Make sure local main isn't behind/ahead of origin in a way that surprises CI.
git fetch --quiet origin "$BRANCH" 2>/dev/null || true
if git rev-parse "@{u}" >/dev/null 2>&1; then
  LOCAL="$(git rev-parse @)"; REMOTE="$(git rev-parse '@{u}')"
  if [ "$LOCAL" != "$REMOTE" ] && [ -n "$(git rev-list '@{u}..@' 2>/dev/null)" ] && [ -n "$(git rev-list '@..@{u}' 2>/dev/null)" ]; then
    die "Local '$BRANCH' has diverged from origin. Reconcile before releasing."
  fi
fi

PKG_NAME="$(node -p "require('./package.json').name")"
CUR_VERSION="$(node -p "require('./package.json').version")"
info "Package: $PKG_NAME @ $CUR_VERSION"

# Warn if this version is already on npm (CI would fail to republish it).
if npm view "${PKG_NAME}@${CUR_VERSION}" version >/dev/null 2>&1; then
  warn "${PKG_NAME}@${CUR_VERSION} is already published. The version bump below will move past it."
fi

echo

# --- preview each bump from the *actual* current version --------------------
# Strips any existing pre-release/build suffix before computing.
BASE="${CUR_VERSION%%-*}"
IFS='.' read -r MAJ MIN PAT <<<"$BASE"
PATCH_NEXT="$MAJ.$MIN.$((PAT + 1))"
MINOR_NEXT="$MAJ.$((MIN + 1)).0"
MAJOR_NEXT="$((MAJ + 1)).0.0"
PRE_NEXT="${MAJ}.${MIN}.$((PAT + 1))-${PREID}.0"   # npm prints the exact value

# --- choose release type ----------------------------------------------------
if [ -z "$RELEASE_TYPE" ]; then
  bold "What kind of release is this?  (current: $CUR_VERSION)"
  echo "  1) patch       — bug fixes              ($CUR_VERSION → $PATCH_NEXT)"
  echo "  2) minor       — new, backward-compat   ($CUR_VERSION → $MINOR_NEXT)"
  echo "  3) major       — breaking changes       ($CUR_VERSION → $MAJOR_NEXT)"
  echo "  4) prerelease  — pre-release tag        ($CUR_VERSION → $PRE_NEXT)"
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

case "$RELEASE_TYPE" in
  patch) NEXT_VERSION="$PATCH_NEXT" ;;
  minor) NEXT_VERSION="$MINOR_NEXT" ;;
  major) NEXT_VERSION="$MAJOR_NEXT" ;;
  *)     NEXT_VERSION="" ;;  # prerelease shapes vary; let npm print the result
esac
if [ -n "$NEXT_VERSION" ]; then
  ok "Release type: $RELEASE_TYPE  ($CUR_VERSION → $NEXT_VERSION)"
else
  ok "Release type: $RELEASE_TYPE  (next version computed by npm)"
fi

IS_PRERELEASE=0
[[ "$RELEASE_TYPE" == pre* ]] && IS_PRERELEASE=1

echo
confirm "Proceed with checks and build?" || die "Aborted."

# --- quality gates (fast-fail; CI re-runs these) ----------------------------
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
  ok "Dry run complete — no version bump, tag, push, or GitHub Release created."
  exit 0
fi

# --- cut the release (CI publishes) -----------------------------------------
echo
bold "Ready to release ${PKG_NAME} (${RELEASE_TYPE})"
warn "This will: bump the version, create a git commit + tag, push to origin, and"
warn "create a GitHub Release. The release triggers CI to publish to npm."
confirm "Cut the release?" || die "Aborted before releasing."

# 1. Version bump — updates package.json, commits, and creates a tag (vX.Y.Z).
if [ "$IS_PRERELEASE" -eq 1 ]; then
  NEW_TAG="$(npm version "$RELEASE_TYPE" --preid="$PREID")"
else
  NEW_TAG="$(npm version "$RELEASE_TYPE")"
fi
ok "Bumped to $NEW_TAG (commit + tag created)"

# 2. Push commit + tag. Roll back locally if the push fails so we can retry.
info "Pushing commit and tag to origin"
if ! git push --follow-tags; then
  warn "Push failed. Rolling back the version commit and tag."
  git tag -d "$NEW_TAG" 2>/dev/null || true
  git reset --hard HEAD~1
  die "Push failed — repository restored to pre-bump state. Fix the issue and re-run."
fi
ok "Pushed commit and tag to origin"

# 3. Create the GitHub Release. This is what triggers the publish workflow.
#    Marking a pre-release tells CI to publish under the 'next' dist-tag.
GH_FLAGS=(--title "$NEW_TAG" --generate-notes)
[ "$IS_PRERELEASE" -eq 1 ] && GH_FLAGS+=(--prerelease)

info "Creating GitHub Release $NEW_TAG"
if ! gh release create "$NEW_TAG" "${GH_FLAGS[@]}"; then
  warn "The commit and tag are pushed, but creating the GitHub Release failed."
  warn "Finish manually (this triggers the publish):"
  warn "    gh release create $NEW_TAG ${GH_FLAGS[*]}"
  die "GitHub Release not created."
fi
ok "GitHub Release created"

echo
bold "🎉 Release $NEW_TAG cut. CI is now publishing ${PKG_NAME} to npm."
info "Watch it:   gh run watch  (or: gh run list --workflow=publish.yml)"
if [ "$IS_PRERELEASE" -eq 1 ]; then
  info "Pre-release → publishes under the 'next' dist-tag. Install with: npm install ${PKG_NAME}@next"
else
  info "Once green: npm install ${PKG_NAME}"
fi
