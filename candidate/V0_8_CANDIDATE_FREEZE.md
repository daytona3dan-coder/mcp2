# MCP2 Candidate v0.8.0 — Freeze Record

Date: 2026-09-23

Frozen Candidate implementation head:

`dc890456594e7d8f8eda92c4fa590800a8636942`

Protocol version:

`0.8.0-candidate`

Status:

**FROZEN / QUALIFIED**

## Qualification at the frozen head

The exact frozen head completed:

- MCP2 Candidate v0.8 qualification — PASS
- MCP2 Run Twenty-Five clean-room conformance — PASS
- Repair source evidence — PASS

Candidate qualification covers the public reference verifier, independent v0.8 clean-room verifier, v0.8 deterministic vectors, predecessor Run Twenty-Five frozen corpus, schema gates, strict JSON parser behavior, evidence binding, and the portable reconstruction example.

## Freeze contents

Candidate v0.8.0 freezes the reconciled semantics for:

- explicit delegation permission;
- same-principal delegated inheritance;
- same-policy-digest delegated inheritance;
- transitive action/target/time attenuation;
- exact leaf actor binding;
- cycle refusal;
- superseded authority as non-executable;
- verifier-selected protocol version;
- verifier-time validity;
- strict lowercase policy digests;
- strict RFC 3339 `requested_at`;
- closed Core request fields plus declared request extensions;
- trusted extension-specific validation;
- RFC 8785/JCS + UTF-8 + SHA-256 request fingerprints;
- algorithm-labeled receipt fingerprints;
- explicit non-canonicalizable malformed evidence;
- duplicate-member, depth, Unicode, and non-finite-number parser refusal;
- portable external reconstruction from exported request/grant/policy/receipt evidence.

## Historical preservation

Candidate v0.7.0 and Runs Five through Twenty-Five remain historical evidence. Their closed records and frozen 31-vector corpus are not rewritten by Candidate v0.8.0.

## Non-claims

This freeze does not claim:

- formal verification;
- external standards certification;
- independently signed arbitrary live receipts;
- that a receipt alone contains every canonical record required for reconstruction;
- that MCPaios is the MCP2 truth authority;
- that payment, workflow, model, MCP task, or Spec Kit state creates MCP2 authority;
- that any MCPaios production database is migrated by this freeze.

## Product handoff

MCPaios may now pin this exact public Candidate head and run its own product/database qualification before production migration.

PayMAXAIOS remains a separate financial truth domain.
