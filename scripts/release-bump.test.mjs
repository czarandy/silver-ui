import {execFileSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join} from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';
import {afterEach, beforeEach, describe, expect, it} from 'vitest';

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(scriptsDir, 'release-bump.sh');

let root; // a throwaway package with git history

function git(...args) {
  return execFileSync('git', args, {cwd: root, encoding: 'utf8'}).trim();
}

function version() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
}

/** Run release-bump.sh, capturing status + streams instead of throwing. */
function bump(...args) {
  try {
    const stdout = execFileSync('bash', [SCRIPT, ...args], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {...process.env, npm_config_git_tag_version: 'true'},
    });
    return {status: 0, stdout, stderr: ''};
  } catch (error) {
    return {
      status: error.status,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
    };
  }
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'release-bump-'));
  writeFileSync(
    join(root, 'package.json'),
    JSON.stringify({name: 'fake-pkg', version: '1.5.4'}, null, 2),
  );
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  git('add', '-A');
  git('commit', '--quiet', '-m', 'initial');
});

afterEach(() => {
  rmSync(root, {recursive: true, force: true});
});

describe('release-bump.sh', () => {
  it('bumps, tags, and prints just the tag on stdout', () => {
    const {status, stdout} = bump('patch');

    expect(status).toBe(0);
    // stdout is captured into NEW_TAG by the caller, so it must be the tag alone.
    expect(stdout.trim()).toBe('v1.5.5');
    expect(version()).toBe('1.5.5');
    expect(git('tag', '--list')).toBe('v1.5.5');
  });

  it('bumps a pre-release under the given preid', () => {
    const {status, stdout} = bump('prerelease', 'rc');

    expect(status).toBe(0);
    expect(stdout.trim()).toBe('v1.5.5-rc.0');
    expect(version()).toBe('1.5.5-rc.0');
  });

  // The bug: npm commits the bump before tagging, so a tag collision left the
  // commit stranded on the branch and the next release died on "diverged".
  it('rolls the commit back when npm version fails to tag', () => {
    git('tag', '-a', 'v1.5.5', '-m', 'leftover from an aborted release');
    const before = git('rev-parse', 'HEAD');

    const {status, stderr} = bump('patch');

    expect(status).toBe(1);
    expect(git('rev-parse', 'HEAD')).toBe(before); // no stranded commit
    expect(version()).toBe('1.5.4'); // package.json restored
    expect(git('status', '--porcelain')).toBe(''); // tree still clean
    expect(stderr).toMatch(/Rolled back the partial version bump/);
  });

  it('leaves the pre-existing tag alone when it rolls back', () => {
    git('tag', '-a', 'v1.5.5', '-m', 'leftover');
    const tagged = git('rev-parse', 'v1.5.5');

    bump('patch');

    // Deleting it is the user's call — it may be a real, already-published tag.
    expect(git('rev-parse', 'v1.5.5')).toBe(tagged);
  });

  it("surfaces npm's own error rather than swallowing it", () => {
    git('tag', '-a', 'v1.5.5', '-m', 'leftover');

    const {stderr} = bump('patch');

    expect(stderr).toMatch(/already exists/);
    expect(stderr).toMatch(/npm version patch failed/);
  });

  it('prints nothing on stdout when the bump fails', () => {
    git('tag', '-a', 'v1.5.5', '-m', 'leftover');

    const {stdout} = bump('patch');

    // A stray line here would be captured as the tag and used to cut a release.
    expect(stdout.trim()).toBe('');
  });

  describe('--check', () => {
    it('passes when the tag is free', () => {
      const {status} = bump('--check', 'v1.5.5');

      expect(status).toBe(0);
    });

    it('fails with the exact remedy when the tag already exists', () => {
      git('tag', '-a', 'v1.5.5', '-m', 'leftover');

      const {status, stderr} = bump('--check', 'v1.5.5');

      expect(status).toBe(1);
      expect(stderr).toMatch(/git tag -d v1\.5\.5/);
      expect(stderr).toMatch(/aborted release/);
    });

    it('does not touch the repository', () => {
      git('tag', '-a', 'v1.5.5', '-m', 'leftover');
      const before = git('rev-parse', 'HEAD');

      bump('--check', 'v1.5.5');

      expect(git('rev-parse', 'HEAD')).toBe(before);
      expect(version()).toBe('1.5.4');
    });

    it('rejects a missing tag argument', () => {
      const {status, stderr} = bump('--check');

      expect(status).toBe(1);
      expect(stderr).toMatch(/Usage: release-bump\.sh --check/);
    });

    // A tag on origin is the case that actually wedges releases: release-sync
    // fetches --tags every run, so `git tag -d` is undone before npm ever runs.
    describe('when the tag is on origin', () => {
      let remote;

      beforeEach(() => {
        // Outside `root`, so the bare repo never dirties the package's tree.
        remote = mkdtempSync(join(tmpdir(), 'release-bump-remote-'));
        execFileSync('git', ['init', '--bare', '--quiet', remote]);
        git('remote', 'add', 'origin', remote);
        git('tag', '-a', 'v1.5.5', '-m', 'pushed by an aborted release');
        git('push', '--quiet', 'origin', 'v1.5.5');
        git('tag', '-d', 'v1.5.5'); // gone locally, still on origin
      });

      afterEach(() => {
        rmSync(remote, {recursive: true, force: true});
      });

      it('fails even though the tag is absent locally', () => {
        const {status} = bump('--check', 'v1.5.5');

        expect(status).toBe(1);
      });

      it('gives the remote remedy, not a useless local delete', () => {
        const {stderr} = bump('--check', 'v1.5.5');

        expect(stderr).toMatch(/git push --delete origin v1\.5\.5/);
        expect(stderr).toMatch(/next sync fetches it back/);
      });

      it('passes for a tag origin does not have', () => {
        expect(bump('--check', 'v1.6.0').status).toBe(0);
      });
    });
  });

  it('rejects a missing release type', () => {
    const {status, stderr} = bump();

    expect(status).toBe(1);
    expect(stderr).toMatch(/Usage: release-bump\.sh/);
  });
});
