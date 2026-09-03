import assert from 'node:assert/strict';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { sha256Hex } from './verifier.mjs';

const verifier = fs.readFileSync(new URL('./verifier.mjs', import.meta.url), 'utf8');
const manifest = JSON.parse(gunzipSync(fs.readFileSync(new URL('./vectors.json.gz', import.meta.url))).toString('utf8'));
const imports = [...verifier.matchAll(/^import\s+.+?from\s+['"]([^'"]+)['"];?$/gm)].map(m => m[1]);
assert.deepEqual(imports, ['node:crypto'], 'clean-room verifier may import only node:crypto');
assert.equal(/from\s+['"]\.\.?\//.test(verifier), false, 'clean-room verifier must not import sibling implementation code');
assert.equal(/https?:\/\//.test(verifier), false, 'clean-room verifier must not use network URLs');
assert.equal(/\bfetch\s*\(/.test(verifier), false, 'clean-room verifier must not perform network fetch');
assert.equal(manifest.generated_by, 'independent-python-fixture-generator');
assert.equal(manifest.vector_count, 31);
assert.equal(sha256Hex(manifest), '12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef');
console.log('Run Twenty-Five clean-room independence guard: PASS');
