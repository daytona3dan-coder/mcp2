# MCP2 Run Twenty-Five — Independent Conformance / Clean-Room Reconstruction

## Status

IN PROGRESS

## Goal

Prove that MCP2 conformance decisions can be independently reconstructed in the public MCP2 repository without calling or importing MCPaios.

## Intended constitutional rule

> **MCPaios ≠ MCP2 Truth Authority.**

## Clean-room boundary

The Run Twenty-Five verifier must:

- live only in the public `mcp2` repository;
- import only Node built-ins;
- not import the existing MCP2 reference verifier;
- not import or call MCPaios;
- not connect to Supabase, Vault, Drive, Stripe, Dropbox, or GitHub APIs at verification time;
- use public conformance vectors and explicit bundle inputs only;
- use a deliberately public conformance HMAC key instead of any operational secret.

## Conformance surface

Run Twenty-Five independently reconstructs representative constitutional semantics proved across the closed run corpus:

- exact actor/action/target/policy authority checks;
- bounded grant lifetime;
- ancestor/delegation invalidation;
- replay denial;
- receipt hash and authority binding;
- authenticated witness freshness;
- canonical-freshness mismatch;
- root retirement/compromise current-ineligibility;
- root rollback/resurrection resistance;
- timestamp-provider threshold membership;
- current vs historical provider epochs;
- compromised-provider exclusion and rejoin resistance;
- provider qualification before admission;
- external timestamp PRE/POST threshold classification.

The conformance suite does not claim to reimplement every provider transport, database trigger, Desktop resource boundary, or operational storage mechanism used in Runs Five–Twenty-Four.

## Vector corpus

Protocol: `mcp2-clean-room-conformance/1`

Vector count: `31`

Expected manifest digest:

`12e890408778f425a26d696d5706ad453615e629ecf671a61acba0a84d58b8ef`

The fixture corpus was generated independently in Python; the qualifying verifier is Node.js.

## Acceptance gates

1. Independence guard passes.
2. Manifest digest exact-matches the frozen expected digest.
3. All 31 clean-room vectors pass.
4. Public evidence binding verifies the vector verdict vocabulary and Run Twenty-Four config digests against closed evidence files.
5. GitHub Actions executes in the public `mcp2` repository.
6. No MCPaios checkout, package, API, database, secret, or runtime access is available to the verifier.
7. Tampered receipt, witness freshness, provider membership, root epoch, and provenance cases fail deterministically.
8. Only documentation may change after the final tested implementation head.
9. Publish a sanitized Run Twenty-Five PASS evidence record only after all gates pass.

## Non-claims

Run Twenty-Five does not claim:

- formal verification of MCP2;
- independent re-execution of every physical provider/storage boundary from prior runs;
- access to operational HMAC/Vault secrets;
- RFC 3161 compliance;
- safety against two colluding timestamp providers;
- standards adoption or external interoperability certification.

It proves the narrower property that a separate public implementation can reproduce the selected MCP2 authority/conformance decisions from explicit public test inputs without trusting MCPaios as the decision engine.
