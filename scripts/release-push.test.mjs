import {execFileSync} from 'node:child_process';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(scriptsDir, 'release-push.sh');

let root; // holds the bare "remote" and our clone
let clone;

function git(cwd, ...args) {
  return execFileSync('git', args, {cwd, encoding: 'utf8'}).trim();
}

function commit(cwd, message) {
  writeFileSync(join(cwd, `${message}.txt`), message);
  git(cwd, 'add', '-A');
  git(cwd, 'commit', '--quiet', '-m', message);
  return git(cwd, 'rev-parse', 'HEAD');
}

/** Run release-push.sh, capturing status + merged output instead of throwing. */
function push(tag, preBumpSha) {
  try {
    const stdout = execFileSync('bash', [SCRIPT, tag, preBumpSha], {
      cwd: clone,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    });
    return {status: 0, output: stdout};
  } catch (error) {
    return {
      status: error.status,
      output: `${error.stdout ?? ''}${error.stderr ?? ''}`,
    };
  }
}

/** What origin has under a tag name, or '' if nothing. */
function remoteTag(name) {
  const out = git(clone, 'ls-remote', '--tags', 'origin', `refs/tags/${name}`);
  return out ? out.split(/\s+/)[0] : '';
}

/** Simulate `npm version`: a bump commit plus its annotated tag. */
function bump(tag) {
  const sha = commit(clone, tag.replace(/\./g, '-'));
  git(clone, 'tag', '-a', tag, '-m', tag);
  return sha;
}

/** Land a commit on origin/main that our clone doesn't have — the race. */
function advanceRemote() {
  const other = join(root, 'other');
  git(root, 'clone', '--quiet', join(root, 'remote.git'), other);
  git(other, 'config', 'user.email', 'test@example.com');
  git(other, 'config', 'user.name', 'Test');
  commit(other, 'merged-while-releasing');
  git(other, 'push', '--quiet', 'origin', 'main');
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'release-push-'));
  clone = join(root, 'clone');
  git(
    root,
    'init',
    '--bare',
    '--initial-branch=main',
    join(root, 'remote.git'),
  );
  git(root, 'clone', '--quiet', join(root, 'remote.git'), clone);
  git(clone, 'config', 'user.email', 'test@example.com');
  git(clone, 'config', 'user.name', 'Test');
  commit(clone, 'initial');
  git(clone, 'push', '--quiet', '-u', 'origin', 'main');
});

afterEach(() => {
  rmSync(root, {recursive: true, force: true});
});

describe('release-push.sh', () => {
  it('pushes the commit and tag when origin has not moved', () => {
    const preBump = git(clone, 'rev-parse', 'HEAD');
    bump('v1.5.5');

    const {status, output} = push('v1.5.5', preBump);

    expect(status).toBe(0);
    expect(output).toMatch(/Pushed commit and tag to origin/);
    expect(remoteTag('v1.5.5')).not.toBe('');
    expect(git(clone, 'rev-parse', 'origin/main')).toBe(
      git(clone, 'rev-parse', 'HEAD'),
    );
  });

  // The bug that wedged this repo: --follow-tags pushes branch and tag as
  // independent ref updates. The branch is rejected as non-fast-forward, but
  // the tag is accepted — and the old rollback only cleaned up locally, so the
  // tag stayed on origin and every later release failed to tag.
  describe('when origin moved ahead mid-release', () => {
    it('leaves no tag on origin', () => {
      const preBump = git(clone, 'rev-parse', 'HEAD');
      advanceRemote();
      bump('v1.5.5');

      const {status} = push('v1.5.5', preBump);

      expect(status).toBe(1);
      // Without the fix this is a live tag pointing at an unreachable commit.
      expect(remoteTag('v1.5.5')).toBe('');
    });

    it('restores the local tree to the pre-bump commit', () => {
      const preBump = git(clone, 'rev-parse', 'HEAD');
      advanceRemote();
      bump('v1.5.5');

      push('v1.5.5', preBump);

      expect(git(clone, 'rev-parse', 'HEAD')).toBe(preBump);
      expect(git(clone, 'tag', '--list')).toBe('');
      expect(git(clone, 'status', '--porcelain')).toBe('');
    });

    it('says it cleaned up origin, and why the release failed', () => {
      const preBump = git(clone, 'rev-parse', 'HEAD');
      advanceRemote();
      bump('v1.5.5');

      const {output} = push('v1.5.5', preBump);

      expect(output).toMatch(/Removed v1\.5\.5 from origin/);
      expect(output).toMatch(/restored to pre-bump state/);
    });

    it('leaves the release re-runnable once the branch is synced', () => {
      const preBump = git(clone, 'rev-parse', 'HEAD');
      advanceRemote();
      bump('v1.5.5');
      push('v1.5.5', preBump);

      // The whole point: after rolling back, a synced retry must work — which
      // it cannot if a stale v1.5.5 is still sitting on origin.
      git(clone, 'pull', '--quiet', '--rebase');
      const retryPreBump = git(clone, 'rev-parse', 'HEAD');
      bump('v1.5.5');

      const {status} = push('v1.5.5', retryPreBump);

      expect(status).toBe(0);
      expect(remoteTag('v1.5.5')).not.toBe('');
    });
  });

  it('never deletes a remote tag it did not create', () => {
    // A same-named tag already on origin, pointing somewhere else entirely.
    const other = join(root, 'other-tag');
    git(root, 'clone', '--quiet', join(root, 'remote.git'), other);
    git(other, 'config', 'user.email', 'test@example.com');
    git(other, 'config', 'user.name', 'Test');
    git(other, 'tag', '-a', 'v1.5.5', '-m', 'someone else');
    git(other, 'push', '--quiet', 'origin', 'v1.5.5');
    const theirs = remoteTag('v1.5.5');

    const preBump = git(clone, 'rev-parse', 'HEAD');
    advanceRemote();
    bump('v1.5.5');

    push('v1.5.5', preBump);

    // Rollback must not touch it — deleting it could destroy a real release.
    expect(remoteTag('v1.5.5')).toBe(theirs);
  });

  it('rejects missing arguments', () => {
    expect(push('', '').status).toBe(1);
  });
});
