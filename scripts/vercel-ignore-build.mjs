import process from 'node:process';
import {fileURLToPath} from 'node:url';

// Vercel "ignored build step" (vercel.json ignoreCommand). Exit 1 tells
// Vercel to build the deployment, exit 0 tells it to skip.
//
// Both Vercel projects (the docs site at silver-ui.com and
// storybook.silver-ui.com) build this repo. Production deployments always
// build, but PR previews only build for the docs site — a second storybook
// preview per PR isn't worth the build minutes.

export function shouldBuild(env) {
  if (env.VERCEL_ENV === 'production') {
    return true;
  }

  const productionUrl = env.VERCEL_PROJECT_PRODUCTION_URL ?? '';
  return !productionUrl.startsWith('storybook.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(shouldBuild(process.env) ? 1 : 0);
}
