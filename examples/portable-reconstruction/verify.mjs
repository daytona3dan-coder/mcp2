import fs from 'node:fs';
import { reconstruct, sha256Hex } from '../../reference/clean-room/verifier.mjs';

const bundle = JSON.parse(
  fs.readFileSync(new URL('./bundle.json', import.meta.url), 'utf8')
);

const policyDigest = sha256Hex(bundle.policy);
const requestPolicy = bundle.authority?.request?.policy_digest;
const grants = bundle.authority?.grants ?? [];
const policyBound =
  requestPolicy === policyDigest &&
  grants.every((grant) => grant.policy_digest === policyDigest);

if (!policyBound) {
  console.error(JSON.stringify({
    ok: false,
    error: 'POLICY_DIGEST_BINDING_MISMATCH',
    computed_policy_digest: policyDigest,
    request_policy_digest: requestPolicy
  }, null, 2));
  process.exit(1);
}

const result = reconstruct(bundle);
const ok =
  result.authority?.decision === bundle.receipt?.body?.decision &&
  result.receipt?.verdict === 'VALID' &&
  result.reconstructible === true;

console.log(JSON.stringify({
  ok,
  computed_policy_digest: policyDigest,
  reconstructed: result
}, null, 2));

if (!ok) process.exit(1);
