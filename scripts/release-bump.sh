#!/usr/bin/env bash
#
# release-bump.sh — bump the version, leaving no debris behind if it fails.
#
# Called by release.sh. Prints the new tag (e.g. v1.5.5) on stdout; every human
# message goes to stderr so the caller can capture the tag cleanly.
#
# Why this isn't just `npm version <type>`: npm commits the bump FIRST and tags
# it SECOND. When tagging fails — most often because the tag is left over from
# an earlier aborted release — npm exits non-zero with the bump commit already
# made. release.sh's `set -e` then aborts, stranding an unpushed bump commit on
# the branch. The next release fails on a diverged branch, for reasons that
# have nothing to do with the actual problem. So we undo a partial bump.
#
# --check exists because the bump runs after the whole test+build gate. Finding
# a leftover tag during preflight fails in seconds rather than minutes.
#
# Usage:
#   release-bump.sh --check <tag>           fail if <tag> already exists
#   release-bump.sh <release-type> [preid]  bump; prints the new tag on stdout
#
#   exit 0 = bumped and tagged (or --check found nothing in the way)
#   exit 1 = nothing changed; any partial bump has been rolled back
set -euo pipefail

warn() { printf '\033[33m!\033[0m %s\n' "$1" >&2; }
die() { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

# A tag left over from an aborted release blocks `npm version` forever, and the
# fix is not guessable from npm's "unknown git error". Check the remote as well
# as here: release-sync.sh fetches --tags, so a tag on origin is re-created
# locally on every run and `git tag -d` alone accomplishes nothing.
if [ "${1:-}" = "--check" ]; then
  TAG="${2:-}"
  [ -n "$TAG" ] || die "Usage: release-bump.sh --check <tag>"

  ON_REMOTE=""
  if git ls-remote --tags origin "refs/tags/$TAG" >/dev/null 2>&1; then
    ON_REMOTE="$(git ls-remote --tags origin "refs/tags/$TAG" 2>/dev/null | awk '{print $1}')"
  fi

  if [ -n "$ON_REMOTE" ]; then
    die "Tag $TAG is on origin but this release would create it. If $TAG was really released, this release should be a later version. If it is debris from an aborted release, remove it — deleting it only locally will not help, because the next sync fetches it back: git push --delete origin $TAG"
  fi

  if git rev-parse -q --verify "refs/tags/$TAG" >/dev/null; then
    die "Tag $TAG exists locally (but not on origin) and this release would create it. It is left over from an aborted release — delete it with 'git tag -d $TAG' and re-run."
  fi
  exit 0
fi

RELEASE_TYPE="${1:-}"
PREID="${2:-}"
[ -n "$RELEASE_TYPE" ] || die "Usage: release-bump.sh <release-type> [preid]"

NPM_ARGS=(version "$RELEASE_TYPE")
[ -n "$PREID" ] && NPM_ARGS+=(--preid="$PREID")

# Remember where we were so a partial bump can be undone precisely, rather than
# assuming npm got exactly one commit in.
PRE_BUMP="$(git rev-parse HEAD)"

BUMP_FAILED=0
# npm's own stderr flows to the terminal, so the user sees the real git error.
NEW_TAG="$(npm "${NPM_ARGS[@]}")" || BUMP_FAILED=1

if [ "$BUMP_FAILED" -eq 1 ]; then
  if [ "$(git rev-parse HEAD)" != "$PRE_BUMP" ]; then
    git reset --hard "$PRE_BUMP" >/dev/null 2>&1 \
      || die "npm version failed, and rolling back to $PRE_BUMP also failed. Your working tree needs manual repair."
    warn "Rolled back the partial version bump (npm had already committed it)."
  fi
  die "npm version $RELEASE_TYPE failed — see the error above. Nothing was left behind."
fi

printf '%s\n' "$NEW_TAG"
