import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { reconstruct, sha256Hex } from './verifier.mjs';

const manifest = JSON.parse(gunzipSync(fs.readFileSync(new URL('./vectors.json.gz', import.meta.url))).toString('utf8'));
function clone(v) { return structuredClone(v); }
function setPath(root, path, value) {
  const parts = path.split('.');
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) node = node[/^\d+$/.test(parts[i]) ? Number(parts[i]) : parts[i]];
  const last = /^\d+$/.test(parts.at(-1)) ? Number(parts.at(-1)) : parts.at(-1);
  node[last] = clone(value);
}
function materialize(vector) {
  const bundle = clone(manifest.base_bundle);
  for (const mutation of vector.mutations ?? []) setPath(bundle, mutation.path, mutation.value);
  return bundle;
}
function subset(actual, expected) {
  if (expected === null || typeof expected !== 'object') return Object.is(actual, expected);
  if (Array.isArray(expected)) return Array.isArray(actual) && actual.length === expected.length && expected.every((v,i) => subset(actual[i],v));
  return Object.entries(expected).every(([k,v]) => actual && Object.hasOwn(actual,k) && subset(actual[k],v));
}
let passed = 0;
const failures = [];
for (const vector of manifest.vectors) {
  const result = reconstruct(materialize(vector));
  if (subset(result, vector.expect)) passed++;
  else failures.push({ id: vector.id, expected: vector.expect, actual: result });
}
const report = { protocol: manifest.protocol, vectors: manifest.vectors.length, passed, failed: failures.length, manifest_digest: sha256Hex(manifest), failures };
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
