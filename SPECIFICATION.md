# MCP2 Specification — Candidate v0.6.0

Normative terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used in their conventional standards sense.

## 1. Authority Grant Record

A canonical Authority Grant Record MUST contain:

- `grant_id`
- `principal`
- `actor`
- `intent_ref`
- `actions`
- `targets`
- `policy_ref`
- `policy_digest`
- `valid_from`
- `valid_until`
- `status`
- `delegation`
- `parent_grant_id` (nullable)

A caller MUST NOT be trusted as the source of these fields.

## 2. Verification Request

A request supplies facts about the attempted execution:

- `request_id`
- `grant_id`
- `actor`
- `action`
- `target`
- `policy_digest`
- `nonce`
- `requested_at`

## 3. Decision

A conforming verifier MUST return either `ALLOW` or `DENY`.

A DENY decision SHOULD include one or more deterministic reason codes.

Candidate reason codes:

- `UNKNOWN_GRANT`
- `GRANT_NOT_ACTIVE`
- `NOT_YET_VALID`
- `EXPIRED`
- `ACTOR_MISMATCH`
- `ACTION_NOT_ALLOWED`
- `TARGET_NOT_ALLOWED`
- `POLICY_DIGEST_MISMATCH`
- `ANCESTOR_INVALID`
- `REPLAY`
- `MALFORMED_REQUEST`

## 4. Parent/child authority

A child grant MUST NOT:

- authorize an action absent from its parent
- authorize a target absent from its parent
- start before its parent
- end after its parent
- remain valid when any ancestor is revoked, expired, unknown, or otherwise invalid

## 5. Revocation

A canonical grant with status `revoked` MUST deny future verification.

Revocation of an ancestor MUST invalidate descendants prospectively.

Historical receipts are not deleted by revocation.

## 6. Replay protection

A verifier MUST treat a nonce as single-use within the applicable replay domain.

Nonce consumption MUST occur atomically with an ALLOW decision in production implementations.

## 7. Execution fence

Verification MUST occur at the last responsible moment before protected execution.

Planning-time or session-start authorization alone is insufficient for conformance.

## 8. Receipt

A receipt SHOULD bind:

- decision
- reason codes
- request fingerprint
- grant fingerprint
- policy digest
- verification time
- result fingerprint (when execution occurs)

## 9. Reconstruction

Given canonical records, request facts, replay state as-of decision, and verifier version, an implementation SHOULD be able to reproduce the original decision.
