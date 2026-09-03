import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const spec = read('SPECIFICATION.md');
const profiles = read('PROFILES.md');
const conformance = read('CONFORMANCE.md');
const manifest = JSON.parse(read('protocol-manifest.json'));

test('Candidate v0.7 manifest is internally consistent', () => {
  assert.equal(manifest.protocol, 'MCP2');
  assert.equal(manifest.version, '0.7.0-candidate');
  assert.equal(manifest.status, 'candidate');
  assert.equal(manifest.core_profile, 'MCP2-CORE');
  assert.equal(manifest.proof_corpus.first_closed_run, 5);
  assert.equal(manifest.proof_corpus.last_closed_run, 25);
  assert.equal(manifest.proof_corpus.status, 'CLOSED_PASS');
  assert.equal(manifest.clean_room_conformance.vectors, 31);
  assert.equal(manifest.clean_room_conformance.manifest_digest_sha256, '12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef');
});

test('normative documents preserve the protocol/implementation boundary', () => {
  assert.match(spec, /Candidate v0\.7\.0/);
  assert.match(spec, /MCPaios is not the MCP2 truth authority/);
  assert.match(spec, /last responsible moment/);
  assert.match(spec, /MUST fail closed/);
  assert.match(profiles, /MCP2-CORE/);
  assert.match(profiles, /MCP2-PROVIDER-EPOCH/);
  assert.match(conformance, /Runs Five through Twenty-Five/);
  assert.match(conformance, /clean-room conformance implementation/);
});

test('all manifest normative documents exist', () => {
  for (const p of manifest.normative_documents) assert.ok(fs.existsSync(new URL(`../${p}`, import.meta.url)), p);
});
