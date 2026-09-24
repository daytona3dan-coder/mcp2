import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const source = new URL('./verify.mjs', import.meta.url);
const original = JSON.parse(readFileSync(new URL('./bundle.json', import.meta.url), 'utf8'));
// The fixture contains only simple JSON values; independently sort its keys.
const canonical = value => Array.isArray(value) ? value.map(canonical)
  : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
function run(mutate = () => {}) {
  const directory = mkdtempSync(join(tmpdir(), 'mcp2-portable-'));
  try {
    const bundle = structuredClone(original);
    mutate(bundle);
    // Rebind mutated grants so timestamp cases reach the time check, rather
    // than being rejected earlier solely because their fingerprint changed.
    bundle.receipt.grant_fingerprint = createHash('sha256')
      .update(JSON.stringify(canonical(bundle.grants[0]))).digest('hex');
    copyFileSync(source, join(directory, 'verify.mjs'));
    writeFileSync(join(directory, 'bundle.json'), JSON.stringify(bundle));
    return spawnSync(process.execPath, [join(directory, 'verify.mjs')], { encoding: 'utf8' });
  } finally { rmSync(directory, { recursive: true, force: true }); }
}
function passes(result) {
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).result, 'PASS');
}
function fails(result, message) {
  assert.equal(result.status, 1, result.stderr);
  assert.ok(result.stderr.includes(message), result.stderr);
  assert.ok(!result.stdout.includes('PASS'));
}
test('unchanged portable bundle passes', () => passes(run()));
const operands = [
  ['receipt.verified_at', b => b.receipt, 'verified_at'],
  ['grant.valid_from', b => b.grants[0], 'valid_from'],
  ['grant.valid_until', b => b.grants[0], 'valid_until'],
];
for (const [field, record, key] of operands) {
  for (const value of ['not-a-timestamp', '', null, 0, {}, [], '2026-09-23', '2026-09-23T20:00:00', '2026-13-23T20:00:00Z', undefined]) {
    test(`${field} rejects ${JSON.stringify(value) ?? 'missing'}`, () => {
      fails(run(b => { record(b)[key] = value; }), `invalid timestamp: ${field}`);
    });
  }
}
for (const [value, allowed] of [
  ['2026-09-23T18:59:59.999Z', false],
  ['2026-09-23T19:00:00Z', true],
  ['2026-09-23T20:59:59.999Z', true],
  ['2026-09-23T21:00:00Z', false],
  ['2026-09-23T21:00:00.001Z', false],
  ['2026-09-23T16:00:00-04:00', true],
]) {
  test(`decision time ${value}: ${allowed ? 'ALLOW' : 'reject'}`, () => {
    const result = run(b => { b.receipt.verified_at = value; });
    if (allowed) passes(result); else fails(result, 'grant not valid at decision');
  });
}
test('reversed grant window fails', () => fails(run(b => {
  [b.grants[0].valid_from, b.grants[0].valid_until] = [b.grants[0].valid_until, b.grants[0].valid_from];
}), 'grant not valid at decision'));
