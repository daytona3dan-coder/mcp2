import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryAuthorityStore, verify } from '../src/verifier.js';
import { parseJsonRejectDuplicateKeys } from '../src/strict-json.js';

const POLICY = 'a'.repeat(64);
const NOW = new Date('2026-09-02T13:30:00Z');
const V07 = Object.freeze({ protocolVersion: '0.7.0-candidate' });
const EXAMPLE_VALIDATORS = Object.freeze({
  'mcpaios.example.v1': (value) => !!value && typeof value === 'object' && !Array.isArray(value),
});
function verify07(req, store, now = NOW) { return verify(req, store, now, V07); }

function grant(overrides = {}) {
  return {
    grant_id: 'AG-001',
    principal: 'human:dan',
    actor: 'agent:alpha',
    intent_ref: 'spec:task-17',
    actions: ['vault.read'],
    targets: ['chatvault:record-001'],
    policy_ref: 'policy:mcp2-demo',
    policy_digest: POLICY,
    valid_from: '2026-09-02T13:00:00Z',
    valid_until: '2026-09-02T14:00:00Z',
    status: 'active',
    delegation: { allowed: true },
    parent_grant_id: null,
    ...overrides
  };
}
function request(overrides = {}) {
  return {
    request_id: 'REQ-001',
    grant_id: 'AG-001',
    actor: 'agent:alpha',
    action: 'vault.read',
    target: 'chatvault:record-001',
    policy_digest: POLICY,
    nonce: 'nonce-001',
    requested_at: NOW.toISOString(),
    ...overrides
  };
}

test('allows exact valid authority', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.equal(verify07(request(), s, NOW).decision, 'ALLOW');
});

test('denies wrong actor', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify07(request({actor:'agent:evil'}), s, NOW);
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ACTOR_MISMATCH'));
});

test('denies wrong action', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify07(request({action:'vault.delete'}), s, NOW).reasons.includes('ACTION_NOT_ALLOWED'));
});

test('denies wrong target', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify07(request({target:'chatvault:record-999'}), s, NOW).reasons.includes('TARGET_NOT_ALLOWED'));
});

test('denies policy drift', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify07(request({policy_digest:'b'.repeat(64)}), s, NOW).reasons.includes('POLICY_DIGEST_MISMATCH'));
});

test('denies expired grant', () => {
  const s = new MemoryAuthorityStore([grant({valid_until:'2026-09-02T13:29:59Z'})]);
  assert.ok(verify07(request(), s, NOW).reasons.includes('EXPIRED'));
});

test('denies revoked grant', () => {
  const s = new MemoryAuthorityStore([grant({status:'revoked'})]);
  assert.ok(verify07(request(), s, NOW).reasons.includes('GRANT_NOT_ACTIVE'));
});

test('denies replay after successful allow', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.equal(verify07(request(), s, NOW).decision, 'ALLOW');
  const d = verify07(request({request_id:'REQ-002'}), s, NOW);
  assert.ok(d.reasons.includes('REPLAY'));
});

test('denies child after parent revocation', () => {
  const parent = grant({grant_id:'AG-PARENT', actions:['vault.read'], targets:['chatvault:record-001']});
  const child = grant({
    grant_id:'AG-CHILD',
    actor:'agent:child',
    parent_grant_id:'AG-PARENT',
    valid_from:'2026-09-02T13:10:00Z',
    valid_until:'2026-09-02T13:50:00Z'
  });
  const s = new MemoryAuthorityStore([parent, child]);
  let d = verify07(request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-1'}), s, NOW);
  assert.equal(d.decision, 'ALLOW');

  parent.status = 'revoked';
  s.grants.set(parent.grant_id, parent);
  d = verify07(request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-2', request_id:'REQ-CHILD-2'}), s, NOW);
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies child scope expansion', () => {
  const parent = grant({grant_id:'AG-PARENT'});
  const child = grant({
    grant_id:'AG-CHILD',
    actor:'agent:child',
    actions:['vault.read','vault.delete'],
    parent_grant_id:'AG-PARENT',
    valid_from:'2026-09-02T13:10:00Z',
    valid_until:'2026-09-02T13:50:00Z'
  });
  const s = new MemoryAuthorityStore([parent, child]);
  const d = verify07(request({
    grant_id:'AG-CHILD', actor:'agent:child', action:'vault.read', nonce:'child-scope'
  }), s, NOW);
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies unknown grant', () => {
  const s = new MemoryAuthorityStore([]);
  assert.ok(verify07(request(), s, NOW).reasons.includes('UNKNOWN_GRANT'));
});


test('denies child when parent delegation is disabled', () => {
  const parent = grant({grant_id:'AG-PARENT', delegation:{allowed:false}});
  const child = grant({
    grant_id:'AG-CHILD', actor:'agent:child', parent_grant_id:'AG-PARENT',
    valid_from:'2026-09-02T13:10:00Z', valid_until:'2026-09-02T13:50:00Z'
  });
  const s = new MemoryAuthorityStore([parent, child]);
  const d = verify(
    request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-delegation-off'}),
    s, NOW, {protocolVersion:'0.8.0-draft'},
  );
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies child whose principal differs from parent', () => {
  const parent = grant({grant_id:'AG-PARENT'});
  const child = grant({
    grant_id:'AG-CHILD', actor:'agent:child', principal:'human:other',
    parent_grant_id:'AG-PARENT', valid_from:'2026-09-02T13:10:00Z', valid_until:'2026-09-02T13:50:00Z'
  });
  const s = new MemoryAuthorityStore([parent, child]);
  const d = verify(
    request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-principal'}),
    s, NOW, {protocolVersion:'0.8.0-draft'},
  );
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies child whose policy digest differs from parent', () => {
  const parent = grant({grant_id:'AG-PARENT'});
  const childPolicy = 'b'.repeat(64);
  const child = grant({
    grant_id:'AG-CHILD', actor:'agent:child', policy_digest:childPolicy,
    parent_grant_id:'AG-PARENT', valid_from:'2026-09-02T13:10:00Z', valid_until:'2026-09-02T13:50:00Z'
  });
  const s = new MemoryAuthorityStore([parent, child]);
  const d = verify(request({
    grant_id:'AG-CHILD', actor:'agent:child', policy_digest:childPolicy, nonce:'child-policy'
  }), s, NOW, {protocolVersion:'0.8.0-draft'});
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies superseded grant', () => {
  const s = new MemoryAuthorityStore([grant({status:'superseded'})]);
  const d = verify(request({nonce:'superseded'}), s, NOW, {protocolVersion:'0.8.0-draft'});
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('GRANT_NOT_ACTIVE'));
});

test('declared extension context is bound but cannot override actor mismatch', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({
    actor:'agent:evil',
    nonce:'extension-actor',
    extensions:{'mcpaios.example.v1':{actor:'agent:alpha', note:'context only'}}
  }), s, NOW, {
    protocolVersion:'0.8.0-draft',
    declaredExtensions:['mcpaios.example.v1'],
    extensionValidators:EXAMPLE_VALIDATORS,
  });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ACTOR_MISMATCH'));
});

test('undeclared extension is malformed and cannot reach ALLOW', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({
    nonce:'extension-undeclared',
    extensions:{'mcpaios.unknown.v1':{value:true}}
  }), s, NOW, {
    protocolVersion:'0.8.0-draft',
    declaredExtensions:['mcpaios.example.v1'],
    extensionValidators:EXAMPLE_VALIDATORS,
  });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});


test('declared extension cannot override policy mismatch', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({
    policy_digest:'b'.repeat(64),
    nonce:'extension-policy',
    extensions:{'mcpaios.example.v1':{policy_digest:'a'.repeat(64)}}
  }), s, NOW, {
    protocolVersion:'0.8.0-draft',
    declaredExtensions:['mcpaios.example.v1'],
    extensionValidators:EXAMPLE_VALIDATORS,
  });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('POLICY_DIGEST_MISMATCH'));
});

test('v0.8 rejects undeclared top-level request fields', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify({
    ...request({nonce:'top-level-extra'}),
    multi_model:{attempt_id:'caller-smuggled'}
  }, s, NOW, {protocolVersion:'0.8.0-draft'});
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});

test('v0.8 rejects malformed extension container shape', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify({
    ...request({nonce:'bad-extensions'}),
    extensions:[]
  }, s, NOW, {
    protocolVersion:'0.8.0-draft',
    declaredExtensions:['mcpaios.example.v1'],
    extensionValidators:EXAMPLE_VALIDATORS,
  });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});


test('reference verifier requires protocol version from verifier configuration', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.throws(() => verify(request(), s, NOW), /MCP2_PROTOCOL_VERSION_REQUIRED_OR_UNSUPPORTED/);
});

test('strict JSON ingress rejects duplicate actor keys', () => {
  assert.throws(
    () => parseJsonRejectDuplicateKeys('{"actor":"agent:a","actor":"agent:b"}'),
    /duplicate object member "actor"/,
  );
});

test('strict JSON ingress rejects duplicate extensions keys at nested levels', () => {
  assert.throws(
    () => parseJsonRejectDuplicateKeys('{"extensions":{"mcpaios.example.v1":{"x":1,"x":2}}}'),
    /duplicate object member "x"/,
  );
});


test('v0.8 validity uses verifier time, not caller requested_at', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(
    request({ nonce:'verifier-time', requested_at:'1999-01-01T00:00:00Z' }),
    s,
    NOW,
    { protocolVersion:'0.8.0-draft' },
  );
  assert.equal(d.decision, 'ALLOW');
});


test('v0.8 rejects malformed requested_at evidence', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({ nonce:'bad-time', requested_at:'not-a-time' }), s, NOW, { protocolVersion:'0.8.0-draft' });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});

test('v0.8 rejects uppercase policy digest rather than normalizing it', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({ nonce:'upper-policy', policy_digest:POLICY.toUpperCase() }), s, NOW, { protocolVersion:'0.8.0-draft' });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});

test('v0.8 declared extension requires a bound validator', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({
    nonce:'missing-validator',
    extensions:{'mcpaios.example.v1':{note:'context'}}
  }), s, NOW, { protocolVersion:'0.8.0-draft', declaredExtensions:['mcpaios.example.v1'] });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});

test('v0.8 noncanonicalizable request does not consume nonce', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const bad = request({ nonce:'unicode-nonce', extensions:{'mcpaios.example.v1':{note:'\ud800'}} });
  const d = verify(bad, s, NOW, {
    protocolVersion:'0.8.0-draft',
    declaredExtensions:['mcpaios.example.v1'],
    extensionValidators:EXAMPLE_VALIDATORS,
  });
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
  assert.equal(s.usedNonces.has('unicode-nonce'), false);
  assert.equal(d.request_fingerprint, null);
  assert.equal(d.request_fingerprint_alg, 'NONCANONICALIZABLE');
});
