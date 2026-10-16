import {existsSync, rmSync} from 'node:fs';
import {resolve, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {assertEpisodeId} from '../lib/episode-utils';

export function deleteEpisode(episodeId: string, projectRoot = process.cwd()): void {
  const safeId = assertEpisodeId(episodeId);
  const root = resolve(projectRoot);
  const episodeDirectory = resolve(root, 'content', 'episodes', safeId);
  const renderDirectory = resolve(root, 'renders', safeId);
  const staticDirectory = resolve(root, 'static', 'episodes', safeId);
  const propsFile = resolve(root, '.remotion', `${safeId}.props.json`);
  const stylesRoot = resolve(root, 'styles');
  const styleDirectory = resolve(stylesRoot, safeId);
  const episodesRoot = resolve(root, 'content', 'episodes');
  const rendersRoot = resolve(root, 'renders');
  const staticRoot = resolve(root, 'static', 'episodes');
  const remotionRoot = resolve(root, '.remotion');

  if (
    !episodeDirectory.startsWith(episodesRoot + sep) ||
    !renderDirectory.startsWith(rendersRoot + sep) ||
    !staticDirectory.startsWith(staticRoot + sep) ||
    !propsFile.startsWith(remotionRoot + sep) ||
    !styleDirectory.startsWith(stylesRoot + sep)
  ) {
    throw new Error(`Refusing to delete episode outside project: ${safeId}`);
  }
  if (!existsSync(episodeDirectory)) {
    throw new Error(`Episode not found: ${safeId}`);
  }

  rmSync(episodeDirectory, {recursive: true, force: true});
  rmSync(renderDirectory, {recursive: true, force: true});
  rmSync(staticDirectory, {recursive: true, force: true});
  rmSync(propsFile, {force: true});
  rmSync(styleDirectory, {recursive: true, force: true});
}

function runCli(): void {
  const [episodeId] = process.argv.slice(2);
  if (!episodeId) {
    console.error('Usage: npm run delete-episode -- <episode-id>');
    process.exit(1);
  }

  deleteEpisode(episodeId);
  const result = spawnSync('npm', ['run', 'generate-registry'], {stdio: 'inherit', shell: true});
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  console.log(`Deleted episode and generated assets: ${episodeId}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runCli();
}
