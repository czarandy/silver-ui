silver-ui is a React component library, built with [Panda CSS](https://panda-css.com/).

Work on all issues in a new separate worktree.
Run `pnpm install` in a new worktree before your first commit. The Husky hooks live in the generated, untracked `.husky/_` directory, and `core.hooksPath` is shared across worktrees, so until you install, git silently skips the pre-commit format/lint step and CI fails on formatting.
Submit a PR when complete.
Ensure all additions/changes have added tests.
Ensure any new UI features are covered in storybook examples.
We always use Temporal, not Date.
Should use panda cva or sva recipes when appropriate rather than inline css calls.
