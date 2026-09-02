import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryAuthorityStore, verify } from '../src/verifier.js';

const POLICY = 'a'.repeat(64);
const NOW = new Date('2026-09-02T13:30:00Z');

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
  assert.equal(verify(request(), s, NOW).decision, 'ALLOW');
});

test('denies wrong actor', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify(request({actor:'agent:evil'}), s, NOW);
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('ACTOR_MISMATCH'));
});

test('denies wrong action', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify(request({action:'vault.delete'}), s, NOW).reasons.includes('ACTION_NOT_ALLOWED'));
});

test('denies wrong target', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify(request({target:'chatvault:record-999'}), s, NOW).reasons.includes('TARGET_NOT_ALLOWED'));
});

test('denies policy drift', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.ok(verify(request({policy_digest:'b'.repeat(64)}), s, NOW).reasons.includes('POLICY_DIGEST_MISMATCH'));
});

test('denies expired grant', () => {
  const s = new MemoryAuthorityStore([grant({valid_until:'2026-09-02T13:29:59Z'})]);
  assert.ok(verify(request(), s, NOW).reasons.includes('EXPIRED'));
});

test('denies revoked grant', () => {
  const s = new MemoryAuthorityStore([grant({status:'revoked'})]);
  assert.ok(verify(request(), s, NOW).reasons.includes('GRANT_NOT_ACTIVE'));
});

test('denies replay after successful allow', () => {
  const s = new MemoryAuthorityStore([grant()]);
  assert.equal(verify(request(), s, NOW).decision, 'ALLOW');
  const d = verify(request({request_id:'REQ-002'}), s, NOW);
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
  let d = verify(request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-1'}), s, NOW);
  assert.equal(d.decision, 'ALLOW');

  parent.status = 'revoked';
  s.grants.set(parent.grant_id, parent);
  d = verify(request({grant_id:'AG-CHILD', actor:'agent:child', nonce:'child-2', request_id:'REQ-CHILD-2'}), s, NOW);
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
  const d = verify(request({
    grant_id:'AG-CHILD', actor:'agent:child', action:'vault.read', nonce:'child-scope'
  }), s, NOW);
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies unknown grant', () => {
  const s = new MemoryAuthorityStore([]);
  assert.ok(verify(request(), s, NOW).reasons.includes('UNKNOWN_GRANT'));
});
