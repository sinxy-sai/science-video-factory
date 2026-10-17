import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, rmSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {checkAgentHarnessSkills, harnessSkillPaths, requiredGuideReferences} from '../commands/check-agent-harness';

const root = mkdtempSync(join(tmpdir(), 'science-video-agent-harness-'));
try {
  const source = `${requiredGuideReferences.join('\n')}\nshared workflow contract\n`;
  for (const relativePath of harnessSkillPaths) {
    const path = join(root, relativePath);
    mkdirSync(join(path, '..'), {recursive: true});
    writeFileSync(path, source, 'utf8');
  }
  assert.deepEqual(checkAgentHarnessSkills(root), []);

  writeFileSync(join(root, harnessSkillPaths[2]), `${source}changed\n`, 'utf8');
  assert.equal(checkAgentHarnessSkills(root).some((error) => error.includes('contents differ')), true);

  writeFileSync(join(root, harnessSkillPaths[2]), source.replace(requiredGuideReferences[2], 'missing-guide.md'), 'utf8');
  const errors = checkAgentHarnessSkills(root);
  assert.equal(errors.some((error) => error.includes('must reference docs/COMPONENT_GUIDE.md')), true);
  console.log('agent harness compatibility check behaves as expected');
} finally {
  rmSync(root, {recursive: true, force: true});
}
