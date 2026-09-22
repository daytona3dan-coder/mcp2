# MCP2 Candidate v0.7.0 — Known Limitations / Errata

**Status:** Historical clarification only  
**Published:** 2026-09-22  
**Frozen Candidate:** `a85e3b81ed2bb7eb497592ec49b5f63aab2be94e`

This note does not modify Candidate v0.7.0, its closed Runs Five–Twenty-Five proof evidence, or its 31-vector clean-room manifest.

## Delegation-language gap

Candidate v0.7.0 did not state every delegation invariant with the same precision across all artifacts.

In particular:

- `algorithms/delegate.md` and historical MCPaios Run Eleven enforced explicit delegation permission and same-policy inheritance;
- the v0.7 normative specification and public reference/clean-room verifier primarily enforced ancestor state plus action/target/time attenuation;
- therefore a generic v0.7 conformance claim must not be interpreted as proof that every implementation enforced the stronger Run Eleven delegation invariants.

Draft v0.8 makes those invariants explicit and adds new versioned conformance vectors. The v0.7 corpus remains historical evidence of exactly what it demonstrated at the time.

## Implementation-defined request context

Some MCPaios v0.7 product integrations carried additional request context outside the closed public v0.7 verification-request schema. Those product extensions were not part of the public MCP2 v0.7 Core conformance claim.

Draft v0.8 introduces a declared `extensions` container to remove this ambiguity.

## Evidence claim boundary

Run Twenty-Five established implementation-independent reconstruction of selected MCP2 decisions. Candidate v0.7 did not establish that arbitrary live receipts are independently authenticated by third-party signatures.

This note narrows interpretation; it does not rewrite history.
