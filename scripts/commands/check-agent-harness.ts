import {createHash} from 'node:crypto';
import {existsSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

export const harnessSkillPaths = [
  'skills/science-video-workflow/SKILL.md',
  '.agents/skills/science-video-workflow/SKILL.md',
  '.claude/skills/science-video-workflow/SKILL.md',
  '.codex/skills/science-video-workflow/SKILL.md',
] as const;

export const requiredGuideReferences = [
  'docs/WORKFLOW.md',
  'docs/SCENE_GUIDE.md',
  'docs/COMPONENT_GUIDE.md',
] as const;

const sha256 = (content: Buffer): string => createHash('sha256').update(content).digest('hex');

export function checkAgentHarnessSkills(projectRoot: string): string[] {
  const errors: string[] = [];
  const contents: Buffer[] = [];
  for (const relativePath of harnessSkillPaths) {
    const path = join(projectRoot, relativePath);
    if (!existsSync(path)) {
      errors.push(`missing harness skill: ${relativePath}`);
      continue;
    }
    contents.push(readFileSync(path));
    const source = contents[contents.length - 1].toString('utf8');
    for (const guide of requiredGuideReferences) {
      if (!source.includes(guide)) errors.push(`${relativePath} must reference ${guide}`);
    }
  }
  if (contents.length === harnessSkillPaths.length) {
    const hashes = contents.map(sha256);
    if (!hashes.every((hash) => hash === hashes[0])) errors.push(`harness skill contents differ: ${hashes.join(', ')}`);
  }
  return errors;
}

if (process.argv[1] && process.argv[1].endsWith('check-agent-harness.ts')) {
  const errors = checkAgentHarnessSkills(resolve('.'));
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }
  console.log('agent harness skill compatibility check passed');
}
