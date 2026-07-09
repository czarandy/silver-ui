#!/usr/bin/env bash
#
# release-sync.sh — bring the local release branch in line with origin.
#
# Called by release.sh before any checks run, so a release is always cut from
# the latest remote code rather than whatever happened to be checked out.
#
# Fetches (including tags, which the changelog's `git describe` depends on) and
# then, relative to the branch's upstream:
#
#   in sync    -> nothing to do
#   behind     -> fast-forward onto the upstream
#   ahead      -> left alone; `git push --follow-tags` later publishes the commits
#   diverged   -> hard error; reconciling is a human decision
#   no upstream-> warn and continue (nothing to pull from)
#
# The caller guarantees a clean working tree, so the fast-forward cannot
# clobber uncommitted work.
#
# Usage: release-sync.sh <branch>
#   exit 0 = branch is ready to release from
#   exit 1 = unusable state (diverged, fetch failed, bad usage)
set -euo pipefail

info() { printf '\033[36m›\033[0m %s\n' "$1"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

BRANCH="${1:-}"
[ -n "$BRANCH" ] || die "Usage: release-sync.sh <branch>"

# No upstream: a local-only branch has nothing to pull. Releasing from it is
# unusual but legal (release.sh already warned about non-main branches).
if ! UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null)"; then
  warn "Branch '$BRANCH' has no upstream — skipping pull."
  exit 0
fi

# Fetch what the branch actually tracks. The remote branch name need not match
# the local one (`git checkout -b fix origin/main`), so read both off the
# upstream rather than assuming `origin/$BRANCH` exists.
REMOTE_NAME="$(git config --get "branch.${BRANCH}.remote" || echo origin)"
REMOTE_BRANCH="${UPSTREAM#"${REMOTE_NAME}/"}"

info "Fetching $UPSTREAM"
git fetch --quiet --tags "$REMOTE_NAME" "$REMOTE_BRANCH" \
  || die "Failed to fetch $UPSTREAM. Check your network or remote and re-run."

AHEAD="$(git rev-list --count '@{u}..@')"
BEHIND="$(git rev-list --count '@..@{u}')"

if [ "$AHEAD" -gt 0 ] && [ "$BEHIND" -gt 0 ]; then
  die "Local '$BRANCH' has diverged from $UPSTREAM ($AHEAD ahead, $BEHIND behind). Reconcile before releasing."
fi

if [ "$BEHIND" -gt 0 ]; then
  info "Local '$BRANCH' is $BEHIND commit(s) behind $UPSTREAM — fast-forwarding"
  git merge --ff-only '@{u}' --quiet \
    || die "Fast-forward onto $UPSTREAM failed. Reconcile before releasing."
  ok "Fast-forwarded '$BRANCH' to $UPSTREAM"
  exit 0
fi

if [ "$AHEAD" -gt 0 ]; then
  ok "Local '$BRANCH' is up to date with $UPSTREAM ($AHEAD unpushed commit(s) will be released)"
  exit 0
fi

ok "Local '$BRANCH' is up to date with $UPSTREAM"
