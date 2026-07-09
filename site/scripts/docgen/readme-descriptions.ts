import {readFileSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/**
 * Parses the README's `## Components` section into a name → one-line
 * description map, used as the fallback page description for components whose
 * source carries no JSDoc summary. Entries like `**HStack / VStack**` map
 * each listed name.
 */
export function readmeDescriptions(): Map<string, string> {
  const readme = readFileSync(join(repoRoot, 'README.md'), 'utf-8');
  const section = readme.match(/^## Components$([\s\S]*?)(?=^## |^---$)/m);
  const descriptions = new Map<string, string>();
  if (section == null) {
    return descriptions;
  }
  for (const line of section[1].split('\n')) {
    const match = line.match(/^- \*\*(.+?)\*\* — (.+)$/);
    if (match == null) {
      continue;
    }
    for (const name of match[1].split(' / ')) {
      descriptions.set(name.trim(), match[2].trim());
    }
  }
  return descriptions;
}
