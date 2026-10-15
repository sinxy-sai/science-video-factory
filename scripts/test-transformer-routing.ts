import assert from 'node:assert/strict';
import {episode} from '../content/episodes/what-is-transformer/episode';

const summaryScene = episode.manifest.scenes.find((scene) => scene.id === 'summary');
assert.ok(summaryScene);
const rendered = episode.renderScene({scene: summaryScene, frame: 0});
assert.equal((rendered as {type?: {name?: string}}).type?.name, 'TransformerConclusionDiagram');
console.log('Transformer summary uses its own conclusion diagram');
