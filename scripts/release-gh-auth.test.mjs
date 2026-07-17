import {execFileSync} from 'node:child_process';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(scriptsDir, 'release-gh-auth.sh');

// Absolute, so tests can empty PATH to simulate a machine without `gh` without
// also hiding the interpreter.
const BASH = execFileSync('which', ['bash'], {encoding: 'utf8'}).trim();

let stubDir; // holds the fake `gh`, first on PATH
let counter; // file the stub bumps once per `gh api` call
let emptyDir; // a PATH with nothing on it

/**
 * A fake `gh` that serves a scripted sequence of HTTP statuses to `gh api`,
 * one per call, repeating the last one once the sequence runs out. "000" means
 * gh produced no response line at all (network failure).
 */
const GH_STUB = `#!/usr/bin/env bash
set -uo pipefail

if [ "\${1:-}" = "auth" ]; then
  printf 'github.com\\n'
  printf '  X Failed to log in to github.com account czarandy\\n'
  exit 1
fi

if [ "\${1:-}" = "api" ]; then
  n=$(cat "$GH_STUB_COUNTER" 2>/dev/null || echo 0)
  n=$((n + 1))
  printf '%s' "$n" > "$GH_STUB_COUNTER"

  read -r -a codes <<< "$GH_STUB_CODES"
  idx=$((n - 1))
  last=$(( \${#codes[@]} - 1 ))
  [ "$idx" -gt "$last" ] && idx=$last
  code="\${codes[$idx]}"

  if [ "$code" = "000" ]; then
    printf 'gh: could not connect to api.github.com\\n' >&2
    exit 1
  fi

  printf 'HTTP/2.0 %s Stubbed\\n' "$code"
  printf 'Content-Type: application/json\\n'
  printf '\\n'
  printf '{"login":"czarandy"}\\n'
  [ "$code" = "200" ] || exit 1
  exit 0
fi

exit 1
`;

/** Run release-gh-auth.sh against a scripted status sequence. */
function checkAuth(codes, {path} = {}) {
  try {
    const stdout = execFileSync(BASH, [SCRIPT], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        PATH: path ?? `${stubDir}:${process.env.PATH}`,
        GH_STUB_CODES: codes.join(' '),
        GH_STUB_COUNTER: counter,
        RELEASE_GH_AUTH_RETRY_DELAY: '0', // don't actually back off in tests
      },
    });
    return {status: 0, output: stdout};
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

/** How many times the script called `gh api`. */
function apiCalls() {
  return Number(readFileSync(counter, 'utf8'));
}

beforeEach(() => {
  stubDir = mkdtempSync(join(tmpdir(), 'release-gh-auth-'));
  emptyDir = mkdtempSync(join(tmpdir(), 'release-gh-auth-empty-'));
  counter = join(stubDir, 'counter');
  writeFileSync(counter, '0');
  const stub = join(stubDir, 'gh');
  writeFileSync(stub, GH_STUB);
  chmodSync(stub, 0o755);
});

afterEach(() => {
  rmSync(stubDir, {recursive: true, force: true});
  rmSync(emptyDir, {recursive: true, force: true});
});

describe('release-gh-auth.sh', () => {
  it('succeeds when the API authenticates the token', () => {
    const {status, output} = checkAuth(['200']);

    expect(status).toBe(0);
    expect(output).toMatch(/Authenticated to GitHub CLI/);
    expect(apiCalls()).toBe(1);
  });

  it('fails on a genuinely rejected token and points at re-authentication', () => {
    const {status, output} = checkAuth(['401']);

    expect(status).toBe(1);
    expect(output).toMatch(/HTTP 401/);
    expect(output).toMatch(/gh auth refresh -h github\.com/);
    // A 401 is definitive — retrying it would just stall the release.
    expect(apiCalls()).toBe(1);
  });

  it("surfaces gh's own diagnosis on a real auth failure", () => {
    // The bug this replaces swallowed gh's stderr with `2>&1` and guessed.
    const {output} = checkAuth(['401']);

    expect(output).toMatch(/Failed to log in to github\.com account czarandy/);
  });

  it('blames scopes or SSO, not the login, on a 403', () => {
    const {status, output} = checkAuth(['403']);

    expect(status).toBe(1);
    expect(output).toMatch(/HTTP 403/);
    expect(output).toMatch(/scope or SSO/i);
    expect(apiCalls()).toBe(1);
  });

  it('rides out a transient 5xx and succeeds once the API recovers', () => {
    const {status, output} = checkAuth(['503', '503', '200']);

    expect(status).toBe(0);
    expect(output).toMatch(/retrying/i);
    expect(output).toMatch(/Authenticated to GitHub CLI/);
    expect(apiCalls()).toBe(3);
  });

  it('reports a sustained outage as GitHub being down, not a bad token', () => {
    const {status, output} = checkAuth(['503']);

    expect(status).toBe(1);
    expect(output).toMatch(/HTTP 503/);
    expect(output).toMatch(/Your token is fine/);
    expect(output).toMatch(/githubstatus\.com/);
    expect(apiCalls()).toBe(4);
  });

  // The actual regression: a GitHub 503 used to print "Not logged in to GitHub
  // CLI. Run 'gh auth login' first." Following that advice — or gh's own
  // `gh auth logout` suggestion — destroys a working credential.
  it('never tells you to re-login while the API is 5xxing', () => {
    const {output} = checkAuth(['503']);

    expect(output).not.toMatch(/gh auth login/);
    expect(output).not.toMatch(/gh auth logout/);
    expect(output).not.toMatch(/Not logged in/);
  });

  it('treats an unreachable API as an outage rather than an auth problem', () => {
    const {status, output} = checkAuth(['000']);

    expect(status).toBe(1);
    expect(output).toMatch(/HTTP 000/);
    expect(output).toMatch(/Your token is fine/);
    expect(apiCalls()).toBe(4);
  });

  it('does not guess at an unrecognized status', () => {
    const {status, output} = checkAuth(['418']);

    expect(status).toBe(1);
    expect(output).toMatch(/Unexpected response/);
    expect(output).toMatch(/HTTP 418/);
  });

  it('fails clearly when gh is not installed', () => {
    const {status, output} = checkAuth(['200'], {path: emptyDir});

    expect(status).toBe(1);
    expect(output).toMatch(/GitHub CLI \('gh'\) not found/);
  });
});
