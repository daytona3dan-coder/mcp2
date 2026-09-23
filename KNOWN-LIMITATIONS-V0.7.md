# MCP2 Candidate v0.7.0 — Known Limitations / Errata Note

**Status:** historical clarification only  
**Candidate:** `0.7.0-candidate`  
**Frozen commit:** `a85e3b81ed2bb7eb497592ec49b5f63aab2be94e`

This note does **not** modify Candidate v0.7.0, its schemas, Runs Five through Twenty-Five, or the frozen Run Twenty-Five clean-room vector corpus. It records limitations discovered during later v0.8 reconciliation.

## Delegation rule expression

Candidate v0.7 artifacts did not express every intended delegation invariant uniformly.

- `algorithms/delegate.md` and historical MCPaios Run Eleven enforced stronger delegation inheritance, including delegation permission and same governing policy.
- The v0.7 normative `SPECIFICATION.md` stated transitive action/target/time attenuation but did not explicitly state all principal/policy/delegation-permission checks.
- The v0.7 public reference and clean-room authority verifiers enforced ancestor state, action/target subset, and validity containment, but did not independently enforce every stronger Run Eleven/delegate-algorithm invariant.

Therefore a v0.7 conformance claim must be read as conformance to the frozen v0.7 normative documents and vectors—not as proof that every stronger later v0.8 delegation invariant was already enforced.

## Implementation-defined request fields

Candidate v0.7 stated that implementations may add declared extension fields while the published Core verification-request JSON Schema was closed with `additionalProperties: false`. That left the carriage/conformance rule for implementation-defined request context underspecified.

Candidate v0.8 addresses this by defining an optional closed-top-level `extensions` container plus explicit declaration and monotonicity rules.

## Fingerprint portability

Candidate v0.7 required integrity-bound fingerprints but did not define one normative cross-language JSON canonicalization algorithm for all request fingerprints.

Candidate v0.8 adds a portable canonical request encoding requirement. Existing v0.7 fingerprints remain valid historical evidence under the implementation that produced them and are not regenerated.

## Historical proof preservation

No closed proof record is retroactively edited by this note. Protocol evolution is carried by a new version, new vectors, and new qualification evidence.
