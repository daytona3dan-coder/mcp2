# MCP2 — Machine Authority Protocol

**Candidate v0.7.0**

MCP2 defines a protocol for deciding and proving whether a machine possesses valid, bounded, unrevoked authority to perform an exact action against an exact target at an exact time.

> **Bounded before execution. Revocable during execution. Receipted after execution. Reconstructible later.**

Normative terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used in their conventional standards sense.

## 1. Protocol boundary

MCP2 is an authority protocol, not an identity provider, agent framework, transport, secret store, model runtime, MCP replacement, or policy-authoring language.

A conforming implementation MUST distinguish:

- **identity** — who or what the actor is;
- **capability** — what the actor can technically reach;
- **intent** — what the actor is trying to do;
- **authority** — what the actor is permitted to do now;
- **evidence** — what later proves why the decision was made.

Possession of credentials or technical capability MUST NOT by itself imply MCP2 authority.

## 2. Conformance profiles

Every implementation claiming MCP2 conformance MUST declare:

1. the MCP2 protocol version;
2. the implemented profile(s);
3. any implementation-defined replay domain or extension fields.

`MCP2-CORE` is the base profile. Optional evidence profiles are defined in `PROFILES.md`.

An optional profile MUST NOT weaken a `MCP2-CORE` denial.

## 3. Canonical authority

A verifier MUST resolve authority from a canonical authority source controlled by the authority system, not from caller-supplied grant fields.

A caller MAY provide a `grant_id`, but MUST NOT be trusted to supply the canonical grant contents used for authorization.

Canonical authority history SHOULD be append-only or otherwise reconstructible with explicit supersession and revocation.

## 4. Authority Grant Record

A canonical Authority Grant Record MUST bind at least:

- `grant_id`
- `principal`
- `actor`
- `intent_ref`
- `actions`
- `targets`
- `policy_ref`
- `policy_digest`
- `valid_from`
- `valid_until`
- `status`
- `delegation`
- `parent_grant_id` (nullable)

A grant MUST have a bounded validity interval. An implementation MUST NOT interpret an absent or invalid end time as perpetual authority.

## 5. Verification Request

A verification request MUST bind at least:

- `request_id`
- `grant_id`
- `actor`
- `action`
- `target`
- `policy_digest`
- `nonce`
- `requested_at`

The request describes the attempted execution. It does not create authority.

## 6. Verification algorithm

A conforming `MCP2-CORE` verifier MUST, at the last responsible moment before protected execution:

1. validate request shape;
2. resolve the canonical grant using only the authority reference;
3. deny if the grant is unknown;
4. deny unless the grant is currently active;
5. enforce `valid_from <= verification_time < valid_until`;
6. exact-match the actor;
7. require the action to be authorized;
8. require the target to be authorized;
9. exact-match the governing policy digest;
10. walk every ancestor grant;
11. deny if any ancestor is unknown, revoked, expired, not-yet-valid, or otherwise invalid;
12. require every delegated child to be a subset of its parent authority and time bounds;
13. deny a nonce already consumed inside the declared replay domain;
14. atomically consume the nonce with a successful decision in production implementations;
15. return `ALLOW` only if every applicable check succeeds;
16. otherwise return `DENY`.

A verifier MUST fail closed when required authority material cannot be validated.

## 7. Deterministic denial

A `DENY` decision SHOULD contain deterministic reason codes. Core reason vocabulary includes:

- `UNKNOWN_GRANT`
- `GRANT_NOT_ACTIVE`
- `NOT_YET_VALID`
- `EXPIRED`
- `ACTOR_MISMATCH`
- `ACTION_NOT_ALLOWED`
- `TARGET_NOT_ALLOWED`
- `POLICY_DIGEST_MISMATCH`
- `ANCESTOR_INVALID`
- `REPLAY`
- `MALFORMED_REQUEST`

Profiles MAY define additional reason codes. Additional reason codes MUST NOT convert a Core denial into an allow.

## 8. Delegation

A delegated child grant MUST NOT:

- authorize an action absent from its immediate parent;
- authorize a target absent from its immediate parent;
- begin before its parent;
- end after its parent;
- survive invalidation of any ancestor.

Delegation MUST be transitively bounded. A descendant can never possess more authority than the authority chain above it.

## 9. Revocation

A revoked canonical grant MUST deny future verification.

Revocation of an ancestor MUST invalidate descendants prospectively.

Revocation MUST NOT erase historical receipts or historical authority records required for reconstruction.

Current eligibility and historical inspectability are distinct concepts.

## 10. Replay protection

A nonce MUST be single-use inside the declared replay domain.

A production `ALLOW` and its nonce consumption MUST be atomic with respect to competing verification attempts.

A replayed request MUST NOT cross the protected execution boundary a second time.

## 11. Execution fence

MCP2 verification MUST occur at the enforcement boundary immediately before the protected operation, or at an equivalently strong last-responsible-moment fence.

Planning-time approval, session-start approval, or possession of an old `ALLOW` decision MUST NOT substitute for current verification where authority may have changed.

A `DENY` MUST prevent the protected operation from executing.

## 12. Receipt

A conforming implementation MUST emit or durably bind a decision receipt sufficient to identify:

- decision;
- reason codes;
- request identity or fingerprint;
- canonical grant identity or fingerprint;
- policy digest;
- verification time;
- verifier/protocol version;
- result fingerprint when protected execution occurred.

Receipt material MUST be integrity-bound. Tampering that changes authority-relevant receipt material MUST be detectable.

## 13. Reconstruction

Given the canonical records and evidence applicable at the original decision time, a conforming implementation SHOULD be able to reproduce:

- the authority chain;
- grant and ancestor status as-of decision;
- the exact action and target;
- the governing policy digest;
- the original decision;
- the reason for denial when denied;
- the receipt linkage.

Reconstruction MUST distinguish historical validity from current eligibility.

## 14. Evidence profiles

MCP2 evidence profiles extend proof quality without changing Core authority semantics.

Profiles MAY provide:

- independent authority witnesses;
- threshold witness agreement;
- bounded witness freshness;
- freshness-root epochs and compromise recovery;
- external timestamp provenance;
- multi-provider timestamp thresholds;
- timestamp-provider membership epochs and rotation.

Profile rules are normative only for implementations declaring that profile. See `PROFILES.md`.

## 15. Historical versus current trust

Across all profiles:

- evidence that was once valid MUST NOT automatically remain currently eligible;
- revocation, expiry, root compromise, provider compromise, or epoch transition MAY end current eligibility without erasing history;
- a cryptographically valid artifact from a compromised authority MUST NOT by itself establish post-compromise provenance;
- stale distributed authority MUST NOT be treated as executable current authority.

## 16. External time

An implementation declaring an external-time profile MUST treat externally assigned provider time as evidence distinct from self-asserted internal timestamps.

A single provider MUST NOT satisfy a profile whose declared threshold requires multiple providers.

Provider unavailability, disagreement, compromise, and membership rotation MUST be handled according to the declared profile rather than silently reducing the threshold.

## 17. Provider membership

An implementation declaring timestamp-provider membership epochs MUST:

- bind each provider set to a monotonic epoch or equivalent version;
- preserve historical membership for reconstruction;
- prevent a stale provider epoch from being treated as current;
- prevent current-epoch rollback;
- prevent retired-epoch resurrection;
- prevent a compromised provider from regaining current trust merely because its historical evidence still exists;
- bind replacement-provider qualification before admission when the profile requires qualification evidence.

## 18. Conformance and independent verification

MCP2 conformance is defined by the public protocol, declared profiles, schemas, and conformance vectors—not by the behavior or assertions of any single commercial implementation.

A conforming implementation MUST produce the expected deterministic verdicts for the applicable published conformance vectors.

An implementation MAY use MCPaios, but MCPaios is not the MCP2 truth authority.

## 19. Fail-closed rule

When required current authority, canonical state, cryptographic validation, threshold evidence, provider membership, or replay state cannot be established, the verifier MUST fail closed.

Unavailable evidence is not equivalent to affirmative authorization.

## 20. Extension rule

Implementations MAY add fields, transports, storage systems, identity systems, policy languages, or evidence providers.

Extensions MUST NOT:

- weaken Core checks;
- silently reinterpret normative fields;
- turn a normative denial into an allow;
- erase historical authority needed for reconstruction;
- claim an undeclared profile.

## 21. Non-claims

Candidate v0.7.0 does not claim:

- global Byzantine consensus;
- protection against every colluding majority;
- trusted hardware time;
- RFC 3161 compliance unless separately implemented and declared;
- universal identity semantics;
- a particular transport, database, cloud, model provider, or agent framework.

MCP2 specifies bounded machine authority and its proof obligations. Operational deployment choices remain implementation responsibilities.
