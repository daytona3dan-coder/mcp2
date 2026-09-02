import test from 'node:test';
import assert from 'node:assert/strict';
import { MemoryAuthorityStore, verify } from '../src/verifier.js';
import { makeReceipt, reconstruct } from '../src/receipt.js';

const POLICY = 'a'.repeat(64);
const NOW = new Date('2026-09-02T13:30:00Z');

function grant(overrides = {}) {
  return {
    grant_id: 'AG-001', principal: 'human:dan', actor: 'agent:alpha',
    intent_ref: 'spec:task-17', actions: ['vault.read'],
    targets: ['chatvault:record-001'], policy_ref: 'policy:mcp2-demo',
    policy_digest: POLICY, valid_from: '2026-09-02T13:00:00Z',
    valid_until: '2026-09-02T14:00:00Z', status: 'active',
    delegation: { allowed: true }, parent_grant_id: null, ...overrides
  };
}
function request(overrides = {}) {
  return {
    request_id:'REQ-001', grant_id:'AG-001', actor:'agent:alpha',
    action:'vault.read', target:'chatvault:record-001',
    policy_digest:POLICY, nonce:'nonce-extra',
    requested_at:NOW.toISOString(), ...overrides
  };
}

test('denies not-yet-valid grant', () => {
  const s = new MemoryAuthorityStore([grant({valid_from:'2026-09-02T13:31:00Z'})]);
  assert.ok(verify(request(), s, NOW).reasons.includes('NOT_YET_VALID'));
});

test('denies malformed request', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const d = verify({grant_id:'AG-001'}, s, NOW);
  assert.equal(d.decision, 'DENY');
  assert.ok(d.reasons.includes('MALFORMED_REQUEST'));
});

test('denies cyclic ancestry', () => {
  const a = grant({grant_id:'A', parent_grant_id:'B'});
  const b = grant({grant_id:'B', parent_grant_id:'A'});
  const s = new MemoryAuthorityStore([a,b]);
  const d = verify(request({grant_id:'A'}), s, NOW);
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('denies child validity wider than parent', () => {
  const parent = grant({grant_id:'P', valid_from:'2026-09-02T13:10:00Z', valid_until:'2026-09-02T13:50:00Z'});
  const child = grant({grant_id:'C', actor:'agent:child', parent_grant_id:'P',
    valid_from:'2026-09-02T13:00:00Z', valid_until:'2026-09-02T14:00:00Z'});
  const s = new MemoryAuthorityStore([parent,child]);
  const d = verify(request({grant_id:'C',actor:'agent:child'}), s, NOW);
  assert.ok(d.reasons.includes('ANCESTOR_INVALID'));
});

test('receipt binds decision and reconstructs', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const req = request({nonce:'receipt-1'});
  const d = verify(req, s, NOW);
  assert.equal(d.decision, 'ALLOW');
  const r = makeReceipt(d, req, POLICY, {bytes_read:42}, 'RCPT-001');
  assert.equal(r.decision, 'ALLOW');
  assert.ok(r.result_fingerprint);
  const rebuilt = reconstruct({receipt:r, request:req, decision:d});
  assert.equal(rebuilt.valid, true);
});

test('reconstruction detects changed request', () => {
  const s = new MemoryAuthorityStore([grant()]);
  const req = request({nonce:'receipt-2'});
  const d = verify(req, s, NOW);
  const r = makeReceipt(d, req, POLICY, null, 'RCPT-002');
  const changed = {...req, target:'chatvault:record-999'};
  assert.equal(reconstruct({receipt:r, request:changed, decision:d}).valid, false);
});
