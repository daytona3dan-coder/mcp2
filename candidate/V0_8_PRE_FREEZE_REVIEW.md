# MCP2 v0.8 Pre-Freeze Exact-Head Review

Date: 2026-09-23

Reviewed implementation head:

`a2483bf154642ed80f32094a8f20089e3bfcb8f6`

Status:

**PRE-FREEZE REVIEW PASS — candidate version transition still requires a fresh qualification run.**

This is a source-and-executed-CI review of the exact head above. It is not external certification and does not replace the public conformance suite.

## Review scope

The review rechecked the blockers and high-risk inconsistencies raised during the v0.8 reconciliation round:

1. delegated actor wording;
2. request-fingerprint algorithm definition and receipt labeling;
3. verification time at the final authority/replay boundary;
4. malformed/rejected request evidence;
5. extension-specific validation;
6. Core JSON type, digest, and timestamp parity;
7. canonicalizability before nonce mutation;
8. paired public-reference / clean-room conformance;
9. parser duplicate-member, depth, Unicode, and non-finite-number rejection;
10. portable reconstruction evidence availability.

## Source disposition

At the reviewed head:

- request actor matching is explicitly leaf-grant-only; ancestor actors are not compared to the request actor;
- delegated principal, policy digest, action, target, and time attenuation are transitive;
- every v0.8 accepted request uses RFC 8785/JCS + UTF-8 + SHA-256 request fingerprinting;
- receipts identify `request_fingerprint_alg`;
- a non-canonicalizable malformed request can carry a null canonical fingerprint with an explicit non-canonicalizable marker rather than silently changing algorithms;
- canonicalizability is checked before replay state mutation;
- `requested_at` is strict RFC 3339 evidence and verifier time controls current authority;
- lowercase SHA-256 policy digests are enforced;
- declared request extensions require trusted per-extension validators and fail closed when a validator is missing, throws, or rejects;
- parser ingress rejects duplicate JSON members, invalid Unicode scalar data, non-finite numbers, and excessive nesting;
- paired v0.8 reference / clean-room vector execution is wired into CI;
- the portable reconstruction example contains request, canonical grant chain, policy binding, receipt, and verifier time and runs without MCPaios or network access;
- v0.8 decision and execution-receipt schemas require labeled request fingerprints and permit an explicit null canonical fingerprint for non-canonicalizable malformed evidence.

## Executed qualification

For exact head `a2483bf154642ed80f32094a8f20089e3bfcb8f6`:

- **MCP2 v0.8 draft reconciliation** — PASS
- **MCP2 Run Twenty-Five clean-room conformance** — PASS
- **Repair source evidence** — PASS

The v0.7 Run Twenty-Five frozen corpus remains unchanged and green.

## Preserved boundaries

This review does not:

- rewrite Runs Five through Twenty-Five;
- move payment semantics into MCP2;
- make MCPaios the MCP2 truth authority;
- claim live receipts are independently signed;
- claim every operational implementation automatically exports a reconstruction bundle;
- treat external MCP, Spec Kit, task, workflow, or approval state as machine authority.

## Freeze gate

The semantic implementation is ready for the version transition from `0.8.0-draft` to `0.8.0-candidate`.

The transition itself must:

1. change the public manifest/status and normative document labels;
2. move public v0.8 vectors and reference/clean-room qualification to the candidate version identifier;
3. preserve `0.7.0-candidate` behavior and historical evidence;
4. rerun the complete v0.8, reference, clean-room, portable-reconstruction, and predecessor qualification gates;
5. receive a final exact-candidate-head inspection before merge to main.

No MCPaios production pin or production database migration is authorized by this pre-freeze review alone.
