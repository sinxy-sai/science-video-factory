import assert from 'node:assert/strict';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deleteEpisode} from './delete-episode';

const root = mkdtempSync(join(tmpdir(), 'science-video-delete-'));
try {
  mkdirSync(join(root, 'content', 'episodes', 'demo-topic', 'assets'), {recursive: true});
  mkdirSync(join(root, 'renders', 'demo-topic'), {recursive: true});
  mkdirSync(join(root, 'static', 'episodes', 'demo-topic'), {recursive: true});
  mkdirSync(join(root, '.remotion'), {recursive: true});
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'manifest.ts'), 'demo');
  writeFileSync(join(root, 'renders', 'demo-topic', 'demo.mp4'), 'demo');
  writeFileSync(join(root, 'static', 'episodes', 'demo-topic', 'assets.manifest.json'), 'demo');
  writeFileSync(join(root, '.remotion', 'demo-topic.props.json'), 'demo');
  writeFileSync(join(root, '.remotion', 'keep-me.props.json'), 'keep');

  deleteEpisode('demo-topic', root);
  assert.equal(existsSync(join(root, 'content', 'episodes', 'demo-topic')), false);
  assert.equal(existsSync(join(root, 'renders', 'demo-topic')), false);
  assert.equal(existsSync(join(root, 'static', 'episodes', 'demo-topic')), false);
  assert.equal(existsSync(join(root, '.remotion', 'demo-topic.props.json')), false);
  assert.equal(existsSync(join(root, '.remotion', 'keep-me.props.json')), true);
  assert.throws(() => deleteEpisode('missing-topic', root), /Episode not found/);
  assert.throws(() => deleteEpisode('../outside', root), /Invalid episode id/);
  console.log('delete-episode removes source and render directories safely');
} finally {
  rmSync(root, {recursive: true, force: true});
}
