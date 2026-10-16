import assert from 'node:assert/strict';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {deleteEpisode} from '../commands/remove-episode';

const root = mkdtempSync(join(tmpdir(), 'science-video-delete-'));
try {
  mkdirSync(join(root, 'content', 'episodes', 'demo-topic', 'assets'), {recursive: true});
  mkdirSync(join(root, 'content', 'episodes', 'demo-topic', 'hyperframes', 'shot-001'), {recursive: true});
  mkdirSync(join(root, 'content', 'episodes', 'demo-topic', 'manim'), {recursive: true});
  mkdirSync(join(root, 'renders', 'demo-topic'), {recursive: true});
  mkdirSync(join(root, 'static', 'episodes', 'demo-topic'), {recursive: true});
  mkdirSync(join(root, 'styles', 'demo-topic'), {recursive: true});
  mkdirSync(join(root, '.remotion'), {recursive: true});
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'manifest.ts'), 'demo');
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'content-plan.md'), 'demo');
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'shot-design.md'), 'demo');
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'hyperframes', 'shot-001', 'index.html'), 'demo');
  writeFileSync(join(root, 'content', 'episodes', 'demo-topic', 'manim', 'README.md'), 'demo');
  writeFileSync(join(root, 'renders', 'demo-topic', 'demo.mp4'), 'demo');
  writeFileSync(join(root, 'static', 'episodes', 'demo-topic', 'assets.manifest.json'), 'demo');
  writeFileSync(join(root, 'styles', 'demo-topic', 'DESIGN.md'), 'demo');
  writeFileSync(join(root, '.remotion', 'demo-topic.props.json'), 'demo');
  writeFileSync(join(root, '.remotion', 'keep-me.props.json'), 'keep');

  deleteEpisode('demo-topic', root);
  assert.equal(existsSync(join(root, 'content', 'episodes', 'demo-topic')), false);
  assert.equal(existsSync(join(root, 'renders', 'demo-topic')), false);
  assert.equal(existsSync(join(root, 'static', 'episodes', 'demo-topic')), false);
  assert.equal(existsSync(join(root, 'styles', 'demo-topic')), false);
  assert.equal(existsSync(join(root, '.remotion', 'demo-topic.props.json')), false);
  assert.equal(existsSync(join(root, '.remotion', 'keep-me.props.json')), true);
  assert.throws(() => deleteEpisode('missing-topic', root), /Episode not found/);
  assert.throws(() => deleteEpisode('../outside', root), /Invalid episode id/);
  console.log('remove-episode removes episode plans, renderer sources, static assets, and render directories safely');
} finally {
  rmSync(root, {recursive: true, force: true});
}
