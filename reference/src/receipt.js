import { fingerprint } from './canonical.js';

export function makeReceipt(decision, request, policyDigest, result = null, receiptId = null) {
  return {
    receipt_id: receiptId ?? `RCPT-${request.request_id}`,
    decision: decision.decision,
    grant_id: decision.grant_id,
    request_id: decision.request_id,
    verified_at: decision.verified_at,
    request_fingerprint: decision.request_fingerprint,
    grant_fingerprint: decision.grant_fingerprint,
    policy_digest: policyDigest,
    result_fingerprint: result === null ? null : fingerprint(result)
  };
}

export function reconstruct({ receipt, request, decision }) {
  const checks = {
    decision: receipt.decision === decision.decision,
    grant_id: receipt.grant_id === decision.grant_id,
    request_id: receipt.request_id === decision.request_id,
    verified_at: receipt.verified_at === decision.verified_at,
    request_fingerprint:
      receipt.request_fingerprint === decision.request_fingerprint &&
      receipt.request_fingerprint === fingerprint(request),
    grant_fingerprint: receipt.grant_fingerprint === decision.grant_fingerprint
  };
  return {
    valid: Object.values(checks).every(Boolean),
    checks
  };
}
