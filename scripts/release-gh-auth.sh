#!/usr/bin/env bash
#
# release-gh-auth.sh — confirm the GitHub CLI can actually act on our behalf.
#
# Called by release.sh during preflight. CI publishes via a GitHub Release, so
# a release needs working `gh` auth; npm auth is never used locally.
#
# Why this is not just `gh auth status`: that command validates the token by
# calling /user and reports ANY failure as "the token is invalid" — including a
# GitHub-side 5xx. During a GitHub API blip it therefore tells you to
# re-authenticate, and the `gh auth logout` it suggests discards a working
# credential. So we read the HTTP status ourselves and only blame the token on
# an actual 401.
#
# A 5xx is retried briefly, because the API tends to fail intermittently rather
# than flatly. If it persists we still fail — pushing a tag and creating a
# Release would not work either — but we say why accurately instead of sending
# you to re-login.
#
# Usage: release-gh-auth.sh
#   exit 0 = gh is authenticated and the API is answering
#   exit 1 = bad token, missing scope/SSO, or the API is unreachable
#
# Env:
#   RELEASE_GH_AUTH_RETRY_DELAY  seconds of backoff per retry (default 2; 0 in tests)
set -euo pipefail

ok()   { printf '\033[32m✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m!\033[0m %s\n' "$1"; }
die()  { printf '\033[31m✗ %s\033[0m\n' "$1" >&2; exit 1; }

MAX_ATTEMPTS=4
RETRY_DELAY="${RELEASE_GH_AUTH_RETRY_DELAY:-2}"

command -v gh >/dev/null 2>&1 \
  || die "GitHub CLI ('gh') not found. Install it: https://cli.github.com/"

# Echo just the HTTP status code of an authenticated GET, or 000 when `gh`
# returned no response line at all (network down, DNS failure, gh crash).
gh_status() {
  local head_line
  head_line="$(gh api "$1" -i 2>/dev/null | head -1)" || true
  case "$head_line" in
    HTTP/*) printf '%s' "$head_line" | awk '{print $2}' ;;
    *) printf '000' ;;
  esac
}

# Show gh's own diagnosis, indented, so a real auth failure keeps the detail
# the old `2>&1`-swallowing check threw away.
show_gh_auth_status() {
  printf '\n'
  gh auth status 2>&1 | sed 's/^/    /' || true
  printf '\n'
}

attempt=1
while :; do
  CODE="$(gh_status /user)"
  case "$CODE" in
    200)
      ok "Authenticated to GitHub CLI"
      exit 0
      ;;
    401)
      show_gh_auth_status
      die "GitHub rejected your token (HTTP 401). Re-authenticate with 'gh auth refresh -h github.com' (or 'gh auth login'), then re-run."
      ;;
    403)
      show_gh_auth_status
      die "GitHub refused your token (HTTP 403) — a required scope or SSO authorization is likely missing. See the details above."
      ;;
    5??|000)
      if [ "$attempt" -ge "$MAX_ATTEMPTS" ]; then
        die "GitHub's API is not responding (HTTP $CODE) after $MAX_ATTEMPTS attempts. Your token is fine — this is GitHub, not your login. Check https://www.githubstatus.com and re-run later."
      fi
      warn "GitHub API returned HTTP $CODE (attempt $attempt/$MAX_ATTEMPTS) — retrying…"
      sleep "$((attempt * RETRY_DELAY))"
      ;;
    *)
      die "Unexpected response from the GitHub API (HTTP $CODE). Run 'gh auth status' for details."
      ;;
  esac
  attempt=$((attempt + 1))
done
