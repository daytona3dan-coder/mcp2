# MCP2 Candidate v0.7.0 — Conformance Profiles

MCP2 uses profiles so the base machine-authority protocol remains implementable without requiring every optional evidence mechanism.

## MCP2-CORE

`MCP2-CORE` is mandatory for an MCP2 implementation claim.

It requires:

- canonical authority grant resolution;
- bounded validity;
- exact actor/action/target/policy verification;
- transitive delegation bounds;
- revocation propagation;
- replay protection;
- last-responsible-moment execution fencing;
- ALLOW/DENY receipts;
- historical reconstruction sufficient to explain the decision.

## MCP2-WITNESS

Adds independently stored authority-state witness material.

A declaring implementation MUST distinguish canonical authority from witness observations and MUST NOT allow stale witness state to override current canonical revocation.

## MCP2-WITNESS-THRESHOLD

Adds a declared witness threshold. The threshold MUST be explicit and MUST NOT silently decrease because one witness is unavailable.

## MCP2-FRESHNESS

Adds authenticated freshness envelopes with a bounded maximum lifetime.

A freshness artifact MUST bind its issuance and expiry window. Self-extension that changes authority-relevant freshness material without valid authentication MUST fail. Expired evidence MUST fail current-freshness eligibility even if its authentication remains mathematically valid.

## MCP2-ROOT-EPOCH

Adds monotonic freshness-root epochs and compromise recovery.

Only the current eligible root epoch MAY support current freshness. Retired and compromised roots MAY remain inspectable for history. Compromised-root signatures MUST NOT by themselves establish post-compromise provenance. Rollback and root resurrection MUST be rejected.

## MCP2-EXTERNAL-TIME

Adds externally assigned timestamp evidence used to distinguish pre-compromise from post-compromise provenance.

Self-asserted internal time MUST NOT substitute for the required external timestamp evidence.

## MCP2-TIME-THRESHOLD

Adds a declared multi-provider external-time threshold.

A conforming implementation MUST distinguish:

- threshold met;
- threshold unavailable;
- threshold mismatch;
- invalid provider evidence.

A single provider MUST NOT satisfy a declared threshold greater than one.

## MCP2-PROVIDER-EPOCH

Adds monotonic timestamp-provider membership epochs.

A conforming implementation MUST preserve historical membership while enforcing current eligibility. It MUST reject stale provider epochs as current, provider-epoch rollback, retired-epoch resurrection, and compromised-provider rejoin without an explicit separately governed recovery mechanism.

Where replacement-provider qualification is required, external qualification evidence MUST be bound before admission.

## Profile declaration

A product or implementation claiming MCP2 conformance MUST publish a declaration comparable to:

```text
MCP2 version: 0.7.0-candidate
Profiles:
- MCP2-CORE
- MCP2-WITNESS
- MCP2-FRESHNESS
- MCP2-ROOT-EPOCH
```

An implementation MUST NOT claim an evidence profile it does not enforce.

Profiles compose monotonically: adding a profile may create additional DENY conditions or additional evidence requirements, but MUST NOT weaken `MCP2-CORE`.
