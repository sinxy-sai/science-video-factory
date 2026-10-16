import {existsSync, readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import assert from 'node:assert/strict';

const root = resolve('tools', 'renderer-fixture');
const source = readFileSync(resolve(root, 'index.html'), 'utf8');

assert.equal(existsSync(resolve(root, 'index.html')), true);
assert.equal(source.includes('data-composition-id="browser-renderer-fixture"'), true);
assert.equal(source.includes('window.__timelines'), true);
assert.equal(source.includes('<svg'), true);
assert.equal(source.includes('gsap.timeline'), true);
console.log('browser renderer fixture contract is valid');
