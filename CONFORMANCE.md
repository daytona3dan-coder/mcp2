# MCP2 Candidate v0.7.0 — Conformance

## Conformance claim

A valid MCP2 conformance claim MUST identify:

- protocol version;
- declared profiles;
- verifier implementation/version;
- replay-domain semantics;
- conformance-suite version or manifest digest used for qualification.

## Core qualification

An `MCP2-CORE` implementation MUST demonstrate deterministic handling of at least:

- valid authority → ALLOW;
- unknown grant → DENY;
- inactive/revoked grant → DENY;
- not-yet-valid grant → DENY;
- expired grant → DENY;
- actor mismatch → DENY;
- unauthorized action → DENY;
- unauthorized target → DENY;
- policy-digest mismatch → DENY;
- invalid ancestor/delegation chain → DENY;
- replay → DENY;
- malformed request → DENY;
- protected execution not reached after DENY;
- receipt integrity;
- historical decision reconstruction.

## Evidence-profile qualification

Each declared evidence profile MUST pass the vectors assigned to that profile.

Examples include:

- witness agreement/disagreement;
- threshold unavailable versus threshold met;
- freshness expiry;
- witness self-extension tamper;
- canonical-state change overriding fresh stale evidence;
- retired/compromised root behavior;
- root rollback/resurrection rejection;
- pre/post-compromise external-time classification;
- timestamp threshold mismatch/unavailability;
- provider epoch stale/current distinction;
- compromised-provider exclusion;
- replacement qualification and admission;
- provider epoch rollback/resurrection rejection.

## Independent reproducibility

The MCP2 project includes a clean-room conformance implementation and frozen vector corpus established by Run Twenty-Five.

The clean-room verifier is evidence that MCP2 decisions are reproducible without trusting MCPaios. It is not privileged as the only permitted implementation.

A third-party implementation is conforming when it independently satisfies the normative protocol and applicable public vectors.

## Fail closed

A conformance test MUST fail when a required input cannot be validated. Missing evidence MUST NOT be converted into an ALLOW merely to keep a workflow available.

## Evidence corpus

Runs Five through Twenty-Five are the closed executed proof corpus underlying Candidate v0.7.0.

The proof records are historical evidence. They MUST NOT be edited to retrofit later protocol language. Protocol evolution belongs in versioned specification changes and new conformance vectors.

## Candidate status

Candidate v0.7.0 is a protocol candidate, not a claim that every implementation or integration is production-certified.

A candidate implementation SHOULD report exactly which profiles and vectors it has passed rather than using an unqualified "MCP2 compliant" label.
