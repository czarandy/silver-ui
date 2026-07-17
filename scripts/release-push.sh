#!/usr/bin/env bash
#
# release-push.sh — push the version commit and its tag, all or nothing.
#
# Called by release.sh. `git push --follow-tags` sends refs/heads/<branch> and
# refs/tags/<tag> as independent ref updates, and they succeed or fail
# INDEPENDENTLY. If the branch is rejected — someone merged while the release
# was building — the tag can still be accepted. git exits non-zero either way,
# so it reads as "the push failed" while the tag quietly survives on origin.
#
# That is not cosmetic. release-sync.sh fetches --tags on every run, so a stray
# remote tag comes straight back to the next release, and `npm version` can
# never create it again: every subsequent release dies, and deleting the tag
# locally does nothing because the next sync re-downloads it. This is exactly
# how v1.5.5 wedged this repo — a rejected branch push left v1.5.5 on origin,
# and the rollback only cleaned up locally.
#
# So when the push fails, undo the tag on the REMOTE too, not just here.
#
# Usage: release-push.sh <tag> <pre-bump-sha>
#   exit 0 = commit + tag are on origin
#   exit 1 = origin untouched, local tree restored to <pre-bump-sha>
set -euo pipefail

ok() { printf '\033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1"; }
die() { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

TAG="${1:-}"
PRE_BUMP="${2:-}"
{ [ -n "$TAG" ] && [ -n "$PRE_BUMP" ]; } || die "Usage: release-push.sh <tag> <pre-bump-sha>"

# The commit this release tagged, so rollback can tell our tag apart from a
# same-named tag that was already on the remote for some other reason.
TAGGED_COMMIT="$(git rev-parse "${TAG}^{commit}")"

# The commit origin has under this tag, or empty if it has none. Annotated tags
# resolve via the peeled ^{} ref; lightweight tags point at the commit directly.
remote_tag_commit() {
  local peeled
  peeled="$(git ls-remote --tags origin "refs/tags/${TAG}^{}" 2>/dev/null | awk '{print $1}')"
  if [ -n "$peeled" ]; then
    printf '%s' "$peeled"
    return
  fi
  git ls-remote --tags origin "refs/tags/${TAG}" 2>/dev/null | awk '{print $1}'
}

if git push --follow-tags; then
  ok "Pushed commit and tag to origin"
  exit 0
fi

warn "Push failed. Rolling back the version commit and tag."

# Undo a tag that landed even though the branch did not. Guarded on the commit
# so we never delete someone else's tag that happens to share this name.
REMOTE_TAGGED="$(remote_tag_commit)"
if [ -n "$REMOTE_TAGGED" ] && [ "$REMOTE_TAGGED" = "$TAGGED_COMMIT" ]; then
  if git push --delete origin "$TAG" >/dev/null 2>&1; then
    warn "Removed $TAG from origin — the failed push had already left it there."
  else
    warn "Could not remove $TAG from origin. Delete it before the next release, or that release cannot tag: git push --delete origin $TAG"
  fi
fi

git tag -d "$TAG" >/dev/null 2>&1 || true
git reset --hard "$PRE_BUMP" >/dev/null 2>&1 \
  || die "Push failed, and restoring $PRE_BUMP also failed. Your working tree needs manual repair."

die "Push failed — repository restored to pre-bump state. Fix the issue and re-run."
