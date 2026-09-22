import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const spec = read('SPECIFICATION.md');
const profiles = read('PROFILES.md');
const conformance = read('CONFORMANCE.md');
const manifest = JSON.parse(read('protocol-manifest.json'));

test('Draft v0.8 manifest is internally consistent', () => {
  assert.equal(manifest.protocol, 'MCP2');
  assert.equal(manifest.version, '0.8.0-draft');
  assert.equal(manifest.status, 'draft');
  assert.equal(manifest.predecessor_candidate.version, '0.7.0-candidate');
  assert.equal(manifest.predecessor_candidate.commit, 'a85e3b81ed2bb7eb497592ec49b5f63aab2be94e');
  assert.equal(manifest.core_profile, 'MCP2-CORE');
  assert.equal(manifest.predecessor_proof_corpus.first_closed_run, 5);
  assert.equal(manifest.predecessor_proof_corpus.last_closed_run, 25);
  assert.equal(manifest.predecessor_proof_corpus.status, 'CLOSED_PASS');
  assert.equal(manifest.predecessor_clean_room_conformance.vectors, 31);
  assert.equal(manifest.request_extensions.container, 'extensions');
  assert.equal(manifest.request_extensions.declaration_required, true);
});

test('normative documents preserve protocol/implementation and v0.8 boundaries', () => {
  assert.match(spec, /Draft v0\.8\.0/);
  assert.match(spec, /last responsible moment/);
  assert.match(spec, /parent explicitly permits delegation/);
  assert.match(spec, /child principal equals parent principal/);
  assert.match(spec, /child policy digest equals parent policy digest/);
  assert.match(spec, /extensions/);
  assert.match(spec, /RFC 8785/);
  assert.match(spec, /MUST NOT be selected, downgraded, or overridden by fields supplied in the machine execution request/);
  assert.match(spec, /requested_at.*MUST NOT substitute for verifier time/s);
  assert.match(spec, /MUST fail closed/);
  assert.match(profiles, /MCP2-CORE/);
  assert.match(profiles, /MCP2-PROVIDER-EPOCH/);
  assert.match(conformance, /Runs Five through Twenty-Five/);
  assert.match(conformance, /Draft v0\.8\.0/);
});

test('all manifest normative documents exist', () => {
  for (const p of manifest.normative_documents) assert.ok(fs.existsSync(new URL(`../${p}`, import.meta.url)), p);
});
