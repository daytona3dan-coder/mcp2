# MCP2 Candidate v0.8.0 — Conformance

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
- parent delegation disabled → DENY;
- child principal differs from parent → DENY;
- child policy digest differs from parent → DENY;
- superseded referenced grant or ancestor → DENY;
- valid multi-hop delegation chain → ALLOW;
- invalid delegation invariant two or more hops up → DENY;
- ancestry cycle or declared traversal-resource exhaustion → DENY;
- verifier-selected protocol version cannot be overridden by request input;
- verifier time, not caller `requested_at`, controls validity;
- malformed or undeclared required extension context → DENY/fail closed;
- extension context cannot override a Core actor/action/target/policy denial;
- replay → DENY;
- malformed request → DENY;
- protected execution not reached after DENY;
- duplicate JSON object members rejected at parser ingress;
- RFC 8785/JCS request fingerprint golden vectors;
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

Runs Five through Twenty-Five remain the closed executed proof corpus underlying Candidate v0.7.0 and the historical baseline for Candidate v0.8.0.

Those proof records MUST NOT be edited to retrofit v0.8 language. Candidate v0.8 semantics require new versioned tests/vectors and new qualification evidence.

## Candidate status

Candidate v0.8.0 is a frozen protocol Candidate. Candidate status does not claim that every implementation or integration is production-certified.

An implementation SHOULD report exactly which protocol version, profiles, extensions, and vectors it has passed rather than using an unqualified "MCP2 compliant" label.
