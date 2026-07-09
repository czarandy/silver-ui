import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(scriptsDir, 'release-sync.sh');

let root; // temp dir holding both the fake remote and the clone
let clone;

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

/** Commit a file so each call produces a distinct commit. */
function commit(cwd, message) {
  writeFileSync(join(cwd, `${message}.txt`), message);
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '-m', message);
}

/** Run release-sync.sh, capturing status + merged output instead of throwing. */
function sync(cwd, branch = 'main') {
  try {
    const stdout = execFileSync('bash', [SCRIPT, branch], {
      cwd,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return {status: 0, output: stdout};
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'release-sync-'));
  const remote = join(root, 'remote.git');
  clone = join(root, 'clone');

  // A non-bare "remote" would refuse pushes to its checked-out branch.
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(root, 'clone', '--quiet', remote, clone);
  git(clone, 'config', 'user.email', 'test@example.com');
  git(clone, 'config', 'user.name', 'Test');
  commit(clone, 'initial');
  git(clone, 'push', '--quiet', '-u', 'origin', 'main');
});

afterEach(() => {
  rmSync(root, {recursive: true, force: true});
});

/** Add a commit to origin/main that the clone doesn't have yet. */
function pushRemoteCommit(message) {
  const other = join(root, `other-${message}`);
  git(root, 'clone', '--quiet', join(root, 'remote.git'), other);
  git(other, 'config', 'user.email', 'test@example.com');
  git(other, 'config', 'user.name', 'Test');
  commit(other, message);
  git(other, 'push', '--quiet', 'origin', 'main');
  return git(other, 'rev-parse', 'HEAD');
}

describe('release-sync.sh', () => {
  it('succeeds and stays put when already up to date', () => {
    const before = git(clone, 'rev-parse', 'HEAD');
    const {status, output} = sync(clone);

    expect(status).toBe(0);
    expect(output).toMatch(/up to date with origin/);
    expect(git(clone, 'rev-parse', 'HEAD')).toBe(before);
  });

  it('fast-forwards onto origin when the local branch is behind', () => {
    const remoteHead = pushRemoteCommit('remote-work');

    const {status, output} = sync(clone);

    expect(status).toBe(0);
    expect(output).toMatch(/fast-forwarding/i);
    // The whole point: the release now runs against the remote's latest commit.
    expect(git(clone, 'rev-parse', 'HEAD')).toBe(remoteHead);
  });

  it('fetches tags so the changelog can see the latest release tag', () => {
    pushRemoteCommit('tagged-work');
    const other = join(root, 'other-tagged-work');
    git(other, 'tag', 'v9.9.9');
    git(other, 'push', '--quiet', 'origin', 'v9.9.9');

    expect(sync(clone).status).toBe(0);
    expect(git(clone, 'tag', '--list')).toBe('v9.9.9');
  });

  it('leaves unpushed local commits in place when ahead of origin', () => {
    commit(clone, 'local-work');
    const before = git(clone, 'rev-parse', 'HEAD');

    const {status, output} = sync(clone);

    expect(status).toBe(0);
    expect(output).toMatch(/1 unpushed commit/);
    expect(git(clone, 'rev-parse', 'HEAD')).toBe(before);
  });

  it('fails without touching HEAD when the branch has diverged', () => {
    pushRemoteCommit('remote-work');
    commit(clone, 'local-work');
    const before = git(clone, 'rev-parse', 'HEAD');

    const {status, output} = sync(clone);

    expect(status).toBe(1);
    expect(output).toMatch(/diverged from origin \(1 ahead, 1 behind\)/);
    expect(git(clone, 'rev-parse', 'HEAD')).toBe(before);
  });

  it('warns but succeeds when the branch has no upstream', () => {
    git(clone, 'checkout', '--quiet', '-b', 'local-only');

    const {status, output} = sync(clone, 'local-only');

    expect(status).toBe(0);
    expect(output).toMatch(/no upstream/);
  });

  it('fails when the remote is unreachable', () => {
    git(clone, 'remote', 'set-url', 'origin', join(root, 'does-not-exist.git'));

    const {status, output} = sync(clone);

    expect(status).toBe(1);
    expect(output).toMatch(/Failed to fetch origin\/main/);
  });

  it('rejects a missing branch argument', () => {
    const {status, output} = sync(clone, '');

    expect(status).toBe(1);
    expect(output).toMatch(/Usage: release-sync\.sh/);
  });
});
