import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {resolveDependencyPaths} from '../lib/project-dependencies';

const root = resolve('.');
const requirements = resolve(root, 'requirements.txt');
const current = resolveDependencyPaths(root);
const python = current.python ?? (process.platform === 'win32' ? 'py' : 'python3');

if (!existsSync(resolve(root, '.venv'))) {
  console.log('Creating project Python environment: .venv');
  const created = spawnSync(python, ['-m', 'venv', resolve(root, '.venv')], {stdio: 'inherit', shell: true, cwd: root});
  if (created.status !== 0) process.exit(created.status ?? 1);
}

const paths = resolveDependencyPaths(root);
if (!paths.python) {
  console.error('Project Python was not created at .venv.');
  process.exit(1);
}

const installed = spawnSync(paths.python, ['-m', 'pip', 'install', '--requirement', requirements], {stdio: 'inherit', shell: true, cwd: root});
if (installed.status !== 0) process.exit(installed.status ?? 1);
console.log('Project Python dependencies are ready.');
