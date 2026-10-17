import {copyFileSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join, resolve} from 'node:path';
import {harnessSkillPaths} from './check-agent-harness';

const projectRoot = resolve('.');
const source = join(projectRoot, harnessSkillPaths[0]);
if (!existsSync(source)) throw new Error(`missing shared workflow skill: ${source}`);

for (const relativePath of harnessSkillPaths.slice(1)) {
  const destination = join(projectRoot, relativePath);
  mkdirSync(dirname(destination), {recursive: true});
  copyFileSync(source, destination);
}

console.log(`synchronized science-video-workflow skill to ${harnessSkillPaths.length - 1} harness paths`);
