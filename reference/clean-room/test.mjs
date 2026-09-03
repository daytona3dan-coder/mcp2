import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { reconstruct } from './verifier.mjs';

const manifest = JSON.parse(gunzipSync(fs.readFileSync(new URL('./vectors.json.gz', import.meta.url))).toString('utf8'));

function clone(v) { return structuredClone(v); }
function setPath(root, path, value) {
  const parts = path.split('.');
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = /^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i];
    node = node[key];
  }
  const last = /^\d+$/.test(parts.at(-1)) ? Number(parts.at(-1)) : parts.at(-1);
  node[last] = clone(value);
}
function materialize(vector) {
  const bundle = clone(manifest.base_bundle);
  for (const mutation of vector.mutations ?? []) setPath(bundle, mutation.path, mutation.value);
  return bundle;
}
function assertSubset(actual, expected, path='result') {
  if (expected === null || typeof expected !== 'object') { assert.deepEqual(actual, expected, path); return; }
  if (Array.isArray(expected)) {
    assert.ok(Array.isArray(actual), `${path} must be array`);
    assert.equal(actual.length, expected.length, `${path} length`);
    expected.forEach((v, i) => assertSubset(actual[i], v, `${path}[${i}]`));
    return;
  }
  for (const [k, v] of Object.entries(expected)) {
    assert.ok(actual && Object.hasOwn(actual, k), `${path}.${k} missing`);
    assertSubset(actual[k], v, `${path}.${k}`);
  }
}

test('manifest is clean-room conformance v1', () => {
  assert.equal(manifest.protocol, 'mcp2-clean-room-conformance/1');
  assert.equal(manifest.vector_count, manifest.vectors.length);
  assert.equal(manifest.vectors.length, 31);
});

for (const vector of manifest.vectors) {
  test(`${vector.id} — ${vector.source_run}`, () => {
    const result = reconstruct(materialize(vector));
    assertSubset(result, vector.expect, vector.id);
  });
}
