# MCP2 Run Twenty-Five — PASS

Date: 2026-09-03

## Constitutional rule

> **MCPaios ≠ MCP2 Truth Authority.**

## Claim proved

Run Twenty-Five demonstrated that a separate public implementation can reproduce selected MCP2 authority/conformance decisions from explicit public test inputs without using MCPaios as the decision engine.

The clean-room verifier is contained entirely in public `daytona3dan-coder/mcp2` and has no MCPaios runtime dependency.

## Independence evidence

The verifier:

- imports only `node:crypto`;
- does not import the existing MCP2 reference verifier;
- does not import or call MCPaios;
- performs no network fetch;
- does not connect to Supabase, Vault, Drive, Stripe, Dropbox, or GitHub APIs during verification;
- uses only explicit bundle inputs and frozen public conformance vectors;
- uses a deliberately public HMAC conformance key, not an operational secret.

The qualifying GitHub Actions job checked out only the public `mcp2` repository with read-only contents permission.

Independence guard result:

**PASS**

## Frozen vector corpus

Protocol:

`mcp2-clean-room-conformance/1`

Vectors:

`31`

Frozen manifest digest:

`12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef`

Fixture generation and verification were separated:

- fixture corpus generator: independent Python implementation;
- qualifying verifier: Node.js clean-room implementation.

## Qualification results

Exact tested implementation head:

`768cddd587afbd99dcd07dba475f82020dddfd82`

Public workflow run:

`33748555336`

Public workflow job:

`100626589862`

Node tests:

- total: 32
- passed: 32
- failed: 0

Frozen-vector reconstruction:

- vectors: 31
- passed: 31
- failed: 0
- manifest digest: `12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef`
- failures: none

Closed-public-evidence binding:

**PASS**

## Proof corpus represented by the conformance vectors

The clean-room corpus reproduces selected semantics drawn from closed public proof evidence including:

### Run Five

- valid authority → `ALLOW`
- actor mismatch → `DENY`
- target mismatch → `DENY`
- policy mismatch → `DENY`
- expiration → `DENY`
- revoked ancestor → `DENY`
- replay → `DENY`
- receipt tamper → `RECEIPT_HASH_MISMATCH`
- receipt authority mismatch → `RECEIPT_AUTHORITY_MISMATCH`

### Run Nineteen

- valid fresh witness threshold → trusted
- witness self-extension → `SIGNATURE_INVALID`
- expired witnesses → `WITNESS_FRESHNESS_UNAVAILABLE`
- stale canonical material → `CANONICAL_FRESHNESS_MISMATCH`

### Run Twenty

- retired root → current freshness unavailable / `ROOT_EPOCH_RETIRED` inspection
- compromised root → current freshness unavailable / `ROOT_EPOCH_COMPROMISED` inspection
- root rollback → `MCPAIOS_ROOT_EPOCH_ROLLBACK_FORBIDDEN`
- root resurrection → `MCPAIOS_ROOT_RESURRECTION_FORBIDDEN`

### Run Twenty-Four

- current two-provider threshold → `CURRENT_PROVIDER_THRESHOLD_MET`
- one provider only → `PROVIDER_THRESHOLD_UNAVAILABLE`
- non-current Stripe → `PROVIDER_NOT_CURRENT`
- stale provider epoch → `PROVIDER_EPOCH_STALE`
- historical provider threshold → `HISTORICAL_PROVIDER_THRESHOLD_MET`
- provider rollback → `MCPAIOS_PROVIDER_EPOCH_ROLLBACK_FORBIDDEN`
- provider resurrection → `MCPAIOS_PROVIDER_EPOCH_RESURRECTION_FORBIDDEN`
- compromised-provider rejoin → `MCPAIOS_COMPROMISED_PROVIDER_REJOIN_FORBIDDEN`
- missing qualification → `MCPAIOS_PROVIDER_QUALIFICATION_REQUIRED`
- qualified replacement → `PROVIDER_TRANSITION_ALLOWED`

The evidence-binding gate also pins the accepted Run Twenty-Four configuration digests:

- epoch 1: `18bbc939c5157935fa9b97999181e5ceff1a7727846e0c2b04ea665a08982c54`
- epoch 2: `9fbe1f580ece40ea2f662ac16cbbb0bf21a8a7e4dd2488e601ab89a5dbf1a349`
- epoch 3: `0e1a3337736d96eb5d39792fb38512d1b2eecbeb2ee376b09374b8ed3e1ed204`

### Run Twenty-Three

- 2-of-3 PRE relation → `PRE_COMPROMISE_EXTERNALLY_THRESHOLD_ANCHORED`
- 2-of-3 POST relation → `POST_COMPROMISE_PROVENANCE_UNTRUSTED`
- no threshold agreement → `TIMESTAMP_THRESHOLD_MISMATCH`
- too few valid providers → `TIMESTAMP_THRESHOLD_UNAVAILABLE`

## What independent means here

Run Twenty-Five does not claim an external organization wrote or certified the verifier. It claims implementation independence from MCPaios: the public clean-room code does not consult MCPaios to obtain its verdicts, and its vectors are bound back to closed public proof evidence.

## Implementation/evidence separation

The implementation head was fully qualified before this evidence record was written:

`768cddd587afbd99dcd07dba475f82020dddfd82`

Only Run Twenty-Five documentation/evidence is permitted after that tested implementation head before merge.

## Non-claims

Run Twenty-Five does not claim:

- formal verification;
- third-party certification;
- standards adoption;
- every physical prior-run boundary was re-executed;
- RFC 3161 compliance;
- operational secret disclosure;
- protection against two colluding timestamp providers.

## Verdict

**MCP2 RUN TWENTY-FIVE — PASS**

The selected MCP2 conformance decisions no longer depend on MCPaios being trusted as their sole interpreter.
