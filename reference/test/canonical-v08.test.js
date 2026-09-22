import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalize, fingerprint } from '../src/canonical.js';

const REQUEST = {
  request_id: 'REQ-JCS-1',
  grant_id: 'AG-001',
  actor: 'agent:alpha',
  action: 'vault.read',
  target: 'chatvault:record-001',
  policy_digest: 'a'.repeat(64),
  nonce: 'nonce-jcs',
  requested_at: '2026-09-22T21:00:00Z',
  extensions: {
    'mcpaios.example.v1': {
      z: 'last',
      a: 'first',
      nested: { beta: 'β', alpha: 'α' },
      arr: ['x', 'y'],
    },
  },
};

const EXPECTED = '{"action":"vault.read","actor":"agent:alpha","extensions":{"mcpaios.example.v1":{"a":"first","arr":["x","y"],"nested":{"alpha":"α","beta":"β"},"z":"last"}},"grant_id":"AG-001","nonce":"nonce-jcs","policy_digest":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","request_id":"REQ-JCS-1","requested_at":"2026-09-22T21:00:00Z","target":"chatvault:record-001"}';
const EXPECTED_SHA256 = 'bf1bf72c5199be652be3eb8c851d2ba7a37b555a4861292d084cd7287fa2f49a';

test('v0.8 request canonicalization matches frozen RFC 8785/JCS golden bytes', () => {
  assert.equal(canonicalize(REQUEST), EXPECTED);
  assert.equal(fingerprint(REQUEST), EXPECTED_SHA256);
});

test('canonicalization is independent of object insertion order', () => {
  const reversed = Object.fromEntries(Object.entries(REQUEST).reverse());
  assert.equal(canonicalize(reversed), EXPECTED);
  assert.equal(fingerprint(reversed), EXPECTED_SHA256);
});

test('canonicalization rejects non-finite numbers', () => {
  assert.throws(() => canonicalize({ x: Number.NaN }), /non-finite number/);
  assert.throws(() => canonicalize({ x: Number.POSITIVE_INFINITY }), /non-finite number/);
});

test('canonicalization rejects invalid Unicode scalar data', () => {
  assert.throws(() => canonicalize({ x: '\ud800' }), /invalid unicode scalar data/);
});
