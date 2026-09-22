import test from 'node:test';
import assert from 'node:assert/strict';
import { parseJsonRejectDuplicateKeys } from '../src/parse-json.js';

test('v0.8 parser accepts ordinary canonical request JSON', () => {
  const value = parseJsonRejectDuplicateKeys('{"actor":"agent:a","extensions":{"mcpaios.example.v1":{"value":"x"}}}');
  assert.equal(value.actor, 'agent:a');
});

test('v0.8 parser rejects duplicate Core actor member', () => {
  assert.throws(
    () => parseJsonRejectDuplicateKeys('{"actor":"agent:a","actor":"agent:b"}'),
    /duplicate JSON member: actor/,
  );
});

test('v0.8 parser rejects duplicate extensions member', () => {
  assert.throws(
    () => parseJsonRejectDuplicateKeys('{"extensions":{},"extensions":{"x":{}}}'),
    /duplicate JSON member: extensions/,
  );
});

test('v0.8 parser rejects nested duplicate extension fields', () => {
  assert.throws(
    () => parseJsonRejectDuplicateKeys('{"extensions":{"mcpaios.example.v1":{"value":"a","value":"b"}}}'),
    /duplicate JSON member: value/,
  );
});
