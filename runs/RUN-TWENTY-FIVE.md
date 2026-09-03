# MCP2 Run Twenty-Five — Independent Conformance / Clean-Room Reconstruction

## Status

PASS / CLOSED

## Date

2026-09-03

## Constitutional rule

> **MCPaios ≠ MCP2 Truth Authority.**

## Claim proved

A separate implementation in the public MCP2 repository can reproduce selected MCP2 authority and conformance decisions from explicit public test inputs without importing, calling, connecting to, or trusting MCPaios as the decision engine.

Run Twenty-Five does not replace the physical proofs in Runs Five through Twenty-Four. It proves that the selected decision semantics extracted from those closed proofs are independently executable outside the MCPaios operational implementation.

## Clean-room boundary

The qualifying implementation lives under `reference/clean-room/` in the public `mcp2` repository.

The verifier:

- imports only Node's built-in `node:crypto` module;
- does not import the pre-existing MCP2 reference verifier;
- does not import, package, checkout, or call MCPaios;
- performs no network fetches;
- does not connect to Supabase, Vault, Google Drive, Stripe, Dropbox, or GitHub APIs at verification time;
- consumes only explicit bundle inputs and frozen public conformance vectors;
- uses a deliberately public HMAC conformance key rather than any operational secret.

The GitHub Actions job checked out only `daytona3dan-coder/mcp2` and ran with `contents: read` permission.

## Frozen conformance corpus

Protocol:

`mcp2-clean-room-conformance/1`

Vector count:

`31`

Frozen manifest digest:

`12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef`

The fixture corpus was generated independently in Python. The qualifying verifier is Node.js.

## Covered semantics

The 31 vectors independently exercise representative closed-run rules including:

- exact actor/action/target/policy authority checks;
- grant lifetime and expiration;
- ancestor/delegation invalidation after parent revocation;
- replay denial;
- receipt hash integrity and authority binding;
- witness signature/freshness/max-staleness behavior;
- canonical-freshness mismatch;
- retired and compromised freshness-root current ineligibility;
- root epoch rollback and resurrection rejection;
- current timestamp-provider threshold membership;
- current vs historical provider epochs;
- stale provider epochs and non-current provider exclusion;
- provider epoch rollback and resurrection rejection;
- compromised-provider rejoin rejection;
- replacement-provider qualification before admission;
- PRE/POST external timestamp threshold classification;
- threshold mismatch and threshold unavailability.

## Public evidence binding

The conformance suite does not invent the expected verdict vocabulary from itself. `reference/clean-room/evidence-bindings.mjs` checks the frozen vector expectations against closed public evidence records for Runs Five, Nineteen, Twenty, Twenty-Three, and Twenty-Four, including the accepted Run Twenty-Four provider configuration digests.

Evidence binding result:

**PASS**

## GitHub Actions qualification

Exact tested implementation head:

`768cddd587afbd99dcd07dba475f82020dddfd82`

Public workflow:

`MCP2 Run Twenty-Five clean-room conformance`

PR-triggered workflow run:

`33748555336`

Job:

`100626589862`

All substantive steps passed:

1. Clean-room independence guard — PASS
2. Clean-room conformance tests — PASS
3. Frozen-vector reconstruction — PASS
4. Closed-public-evidence binding — PASS

Node test result:

- tests: `32`
- pass: `32`
- fail: `0`

The 32 tests consist of the manifest gate plus all 31 conformance vectors.

Frozen-vector report:

- vectors: `31`
- passed: `31`
- failed: `0`
- manifest digest: `12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef`
- failures: none

## Representative deterministic tamper/failure cases

The suite includes deterministic negative cases for:

- actor mismatch;
- target mismatch;
- policy mismatch;
- expired child authority;
- revoked parent authority;
- replay;
- receipt tampering;
- receipt/authority mismatch;
- witness self-extension/signature failure;
- expired witness evidence;
- canonical-freshness mismatch;
- retired or compromised root epochs;
- root rollback/resurrection;
- one-provider-only threshold failure;
- non-current timestamp provider;
- stale provider epoch;
- provider rollback/resurrection;
- compromised-provider rejoin;
- missing replacement-provider qualification;
- timestamp threshold disagreement;
- timestamp threshold unavailability.

## Implementation/evidence separation

The final tested implementation head is `768cddd587afbd99dcd07dba475f82020dddfd82`.

After that head, Run Twenty-Five permits documentation/evidence changes only. No verifier, vector, guard, workflow, or evidence-binding implementation change is part of the closure commit.

## Non-claims

Run Twenty-Five does not claim:

- formal verification of MCP2;
- independent re-execution of every physical provider/storage/resource boundary from prior runs;
- access to operational HMAC/Vault secrets;
- RFC 3161 compliance;
- safety against two colluding timestamp providers;
- standards adoption;
- external interoperability certification.

It proves the narrower but important property that MCPaios is not required as the truth oracle for the selected MCP2 conformance decisions.

## Verdict

**MCP2 RUN TWENTY-FIVE — PASS / CLOSED**

Runs Five through Twenty-Five now form the closed executed proof corpus for the current MCP2 proof program.
