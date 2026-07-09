#!/usr/bin/env bash
#
# release.sh — interactive release driver for silver-ui.
#
# This is the LOCAL half of a two-stage release:
#   1. (here) preflight -> pull latest -> checks -> build -> bump version ->
#      tag -> push -> create a GitHub Release.
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
#   scripts/release.sh patch --no-watch # cut the release but don't wait on the CI publish run
#
# Release notes (default: changelog auto-generated from commit titles since the
# previous release tag; shown to you with the option to edit before submitting):
#   scripts/release.sh patch --edit                    # always open the changelog in $EDITOR
#   scripts/release.sh patch --notes="Fixes the X bug" # use this exact text as the notes
#   scripts/release.sh patch --notes-file=NOTES.md     # use a file as the notes
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
WATCH_RUN=1      # --no-watch           : skip streaming the CI publish workflow
PREID="beta"
NOTES_TEXT=""    # --notes "..."        : use this exact text as the release body
NOTES_FILE=""    # --notes-file PATH    : use a file as the release body
EDIT_NOTES=0     # --edit               : always open $EDITOR on the changelog first
NOTES_TMP=""     # temp file for the changelog (cleaned up on exit)
DEFAULT_NOTES="" # changelog auto-generated from commit titles since prev release
PREV_TAG=""      # previous release tag the changelog is computed against

for arg in "$@"; do
  case "$arg" in
    patch|minor|major|prerelease|premajor|preminor|prepatch) RELEASE_TYPE="$arg" ;;
    --yes|-y)         ASSUME_YES=1 ;;
    --dry-run)        DRY_RUN=1 ;;
    --no-watch)       WATCH_RUN=0 ;;
    --preid=*)        PREID="${arg#*=}" ;;
    --notes=*)        NOTES_TEXT="${arg#*=}" ;;
    --notes-file=*)   NOTES_FILE="${arg#*=}" ;;
    --edit|--edit-notes) EDIT_NOTES=1 ;;
    *) die "Unknown argument: $arg" ;;
  esac
done

trap '[ -n "$NOTES_TMP" ] && rm -f "$NOTES_TMP"' EXIT

# Notes sources are mutually exclusive; default (none set) auto-generates them.
if [ -n "$NOTES_FILE" ] && [ -n "$NOTES_TEXT" ]; then
  die "Use only one of --notes or --notes-file."
fi
[ -n "$NOTES_FILE" ] && [ ! -f "$NOTES_FILE" ] && die "Notes file not found: $NOTES_FILE"

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

# Pull the latest remote code so the checks, build, and tag all run against what
# CI will publish — not a stale local checkout. Diverged branches hard-fail.
bash "$SCRIPT_DIR/release-sync.sh" "$BRANCH" || exit 1

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
bold "Regenerating Panda output"
info "panda codegen"; pnpm panda codegen
ok "styled-system up to date"

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

info "Running package smoke test"
node scripts/package-smoke-test.mjs
ok "Package smoke test passed"

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

# Build the default changelog from commit titles since the previous release tag.
# Done BEFORE the version bump so the bump commit itself isn't listed.
if [ -z "$NOTES_FILE" ] && [ -z "$NOTES_TEXT" ]; then
  PREV_TAG="$(git describe --tags --abbrev=0 --match 'v*' 2>/dev/null || true)"
  if [ -n "$PREV_TAG" ]; then
    NOTES_RANGE="${PREV_TAG}..HEAD"
  else
    NOTES_RANGE="HEAD"   # no prior tag: list the whole history
  fi
  DEFAULT_NOTES="$(git log --no-merges --reverse --pretty=format:'- %s' "$NOTES_RANGE")"
  [ -z "$DEFAULT_NOTES" ] && DEFAULT_NOTES="- (no changes since ${PREV_TAG:-the previous release})"
fi

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
GH_FLAGS=(--title "$NEW_TAG")
[ "$IS_PRERELEASE" -eq 1 ] && GH_FLAGS+=(--prerelease)

# Release notes, in priority order: explicit file > inline text > the changelog
# auto-generated from commit titles (shown here, with the option to edit).
if [ -n "$NOTES_FILE" ]; then
  GH_FLAGS+=(--notes-file "$NOTES_FILE")
elif [ -n "$NOTES_TEXT" ]; then
  GH_FLAGS+=(--notes "$NOTES_TEXT")
else
  NOTES_TMP="$(mktemp)"
  printf '%s\n' "$DEFAULT_NOTES" >"$NOTES_TMP"

  echo
  bold "Release notes for $NEW_TAG  (commits since ${PREV_TAG:-the beginning})"
  printf '%s\n' "$DEFAULT_NOTES"
  echo

  # Open the editor if --edit was passed, or (interactively) if the user asks to
  # after seeing the notes. Under --yes we never prompt, so accept them as-is.
  if [ "$EDIT_NOTES" -eq 1 ] \
     || { [ "$ASSUME_YES" -eq 0 ] && confirm "Edit these release notes before submitting?"; }; then
    "${EDITOR:-${VISUAL:-vi}}" "$NOTES_TMP"
  fi
  GH_FLAGS+=(--notes-file "$NOTES_TMP")
fi

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

PUBLISHED_VERSION="${NEW_TAG#v}"   # e.g. v1.1.1 -> 1.1.1
DIST_TAG="latest"
[ "$IS_PRERELEASE" -eq 1 ] && DIST_TAG="next"

# --- watch the publish workflow to completion -------------------------------
# The GitHub Release published above triggers .github/workflows/publish.yml on
# this same version-bump commit. We locate that run and stream its step-by-step
# progress so the release isn't "done" until npm actually has the package.
if [ "$WATCH_RUN" -eq 0 ]; then
  info "Skipping CI watch (--no-watch)."
  info "Watch it:   gh run list --workflow=publish.yml"
  info "Install (once green):   npm install ${PKG_NAME}$([ "$IS_PRERELEASE" -eq 1 ] && echo "@next")"
  exit 0
fi

RELEASE_SHA="$(git rev-parse HEAD)"

# The run takes a few seconds to register after the release event fires. Poll
# for the run whose head commit matches the release commit (filtering by commit
# avoids grabbing an unrelated publish run).
info "Waiting for the publish workflow to start…"
RUN_ID=""
for _ in $(seq 1 30); do
  RUN_ID="$(gh run list --workflow=publish.yml --event=release --limit 15 \
    --json databaseId,headSha,createdAt \
    --jq "[.[] | select(.headSha == \"$RELEASE_SHA\")] | sort_by(.createdAt) | last | .databaseId" \
    2>/dev/null || true)"
  [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ] && break
  RUN_ID=""
  sleep 2
done

if [ -z "$RUN_ID" ]; then
  warn "Couldn't find the publish run automatically (it may still be starting)."
  warn "Watch it manually:  gh run list --workflow=publish.yml"
  warn "                    gh run watch <run-id>"
  exit 0
fi

RUN_URL="$(gh run view "$RUN_ID" --json url --jq .url 2>/dev/null || true)"
ok "Publish workflow started (run $RUN_ID)"
[ -n "$RUN_URL" ] && info "$RUN_URL"
echo

# `gh run watch` live-updates the per-step status; --exit-status makes it return
# non-zero if the run concludes in failure. Guarded so `set -e` doesn't abort
# before we can print guidance.
bold "Streaming CI publish progress"
WATCH_OK=1
gh run watch "$RUN_ID" --exit-status --interval 5 || WATCH_OK=0

echo
if [ "$WATCH_OK" -eq 0 ]; then
  warn "The publish workflow did not succeed."
  [ -n "$RUN_URL" ] && warn "Inspect the failure:  $RUN_URL"
  warn "Or view logs:  gh run view $RUN_ID --log-failed"
  die "Publish failed — ${PKG_NAME}@${PUBLISHED_VERSION} was not published."
fi
ok "Publish workflow completed successfully."

# The npm registry can lag a few seconds behind a successful publish; poll
# briefly to confirm the version is actually resolvable before declaring done.
info "Confirming ${PKG_NAME}@${PUBLISHED_VERSION} on the npm registry…"
PUBLISHED_OK=0
for _ in $(seq 1 15); do
  if npm view "${PKG_NAME}@${PUBLISHED_VERSION}" version >/dev/null 2>&1; then
    PUBLISHED_OK=1
    break
  fi
  sleep 2
done

echo
if [ "$PUBLISHED_OK" -eq 1 ]; then
  bold "✅ ${PKG_NAME}@${PUBLISHED_VERSION} is live on npm (dist-tag: ${DIST_TAG})."
else
  warn "CI reported success but npm hasn't surfaced ${PKG_NAME}@${PUBLISHED_VERSION} yet."
  warn "It's likely just registry lag — check:  npm view ${PKG_NAME}@${PUBLISHED_VERSION}"
fi

if [ "$IS_PRERELEASE" -eq 1 ]; then
  info "Install:  npm install ${PKG_NAME}@next"
else
  info "Install:  npm install ${PKG_NAME}"
fi
