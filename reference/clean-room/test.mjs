import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { evaluateAuthority, reconstruct } from './verifier.mjs';

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


function v08Grant(overrides = {}) {
  return {
    grant_id:'P', principal:'human:dan', actor:'agent:parent',
    intent_ref:'intent:v08', actions:['tool.read'], targets:['urn:target:1'],
    policy_ref:'policy:v08', policy_digest:'a'.repeat(64),
    valid_from:'2026-09-22T20:00:00Z', valid_until:'2026-09-22T22:00:00Z',
    status:'active', delegation:{allowed:true}, parent_grant_id:null, ...overrides
  };
}
function v08Request(overrides = {}) {
  return {
    request_id:'REQ-V08', grant_id:'C', actor:'agent:child', action:'tool.read',
    target:'urn:target:1', policy_digest:'a'.repeat(64), nonce:'nonce-v08',
    requested_at:'2026-09-22T21:00:00Z', ...overrides
  };
}
const v08Now = '2026-09-22T21:00:00Z';

test('v0.8 child with bounded equal-policy delegation allows', () => {
  const parent = v08Grant();
  const child = v08Grant({
    grant_id:'C', actor:'agent:child', parent_grant_id:'P',
    valid_from:'2026-09-22T20:30:00Z', valid_until:'2026-09-22T21:30:00Z'
  });
  assert.equal(evaluateAuthority({now:v08Now, request:v08Request(), grants:[parent,child]}).decision, 'ALLOW');
});

for (const [name, mutate] of [
  ['delegation disabled', (p,c) => { p.delegation={allowed:false}; }],
  ['principal mismatch', (p,c) => { c.principal='human:other'; }],
  ['policy mismatch', (p,c,r) => { c.policy_digest='b'.repeat(64); r.policy_digest='b'.repeat(64); }],
  ['superseded ancestor', (p,c) => { p.status='superseded'; }],
]) {
  test(`v0.8 denies ${name}`, () => {
    const parent=v08Grant();
    const child=v08Grant({
      grant_id:'C', actor:'agent:child', parent_grant_id:'P',
      valid_from:'2026-09-22T20:30:00Z', valid_until:'2026-09-22T21:30:00Z'
    });
    const req=v08Request();
    mutate(parent,child,req);
    const out=evaluateAuthority({now:v08Now, request:req, grants:[parent,child]});
    assert.equal(out.decision,'DENY');
    assert.ok(out.reasons.includes('ANCESTOR_INVALID'));
  });
}

test('v0.8 superseded referenced grant is not executable', () => {
  const grant=v08Grant({grant_id:'C',actor:'agent:child',status:'superseded'});
  const out=evaluateAuthority({now:v08Now,request:v08Request(),grants:[grant]});
  assert.equal(out.decision,'DENY');
  assert.ok(out.reasons.includes('GRANT_NOT_ACTIVE'));
});

test('v0.8 declared extensions are fingerprint-bound but cannot override Core denial', () => {
  const grant=v08Grant({grant_id:'C',actor:'agent:child'});
  const req=v08Request({
    actor:'agent:evil',
    extensions:{'mcpaios.example.v1':{actor:'agent:child'}}
  });
  const out=evaluateAuthority({
    now:v08Now,request:req,grants:[grant],declared_extensions:['mcpaios.example.v1']
  });
  assert.equal(out.decision,'DENY');
  assert.ok(out.reasons.includes('ACTOR_MISMATCH'));
});

test('v0.8 undeclared extension fails closed', () => {
  const grant=v08Grant({grant_id:'C',actor:'agent:child'});
  const req=v08Request({extensions:{'mcpaios.unknown.v1':{value:true}}});
  const out=evaluateAuthority({
    now:v08Now,request:req,grants:[grant],declared_extensions:['mcpaios.example.v1']
  });
  assert.equal(out.decision,'DENY');
  assert.ok(out.reasons.includes('MALFORMED_REQUEST'));
});
