# MCP2 — Machine Authority & Evidence Profile

**Draft v0.8.0**

MCP2 defines transport-independent authority and evidence semantics for deciding and proving whether a machine possesses valid, bounded, unrevoked authority to perform an exact action against an exact target at an exact time.

> **Bounded before execution. Revocable during execution. Receipted after execution. Reconstructible later.**

Normative terms **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are used in their conventional standards sense.

## 1. Authority/evidence boundary

MCP2 is an authority/evidence profile with normative protocol semantics, not an identity provider, agent framework, transport, secret store, model runtime, MCP replacement, or policy-authoring language.

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
3. the implementation-defined replay domain;
4. every implementation-defined request extension identifier and version it accepts.

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

Only an `active` grant is currently executable. A grant with status `revoked` or `superseded` MUST DENY future verification. Revocation or supersession MUST NOT erase historical authority or receipts needed for reconstruction.

## 5. Verification Request

The MCP2 protocol version used for verification MUST be selected by verifier deployment/conformance configuration. It MUST NOT be selected, downgraded, or overridden by fields supplied in the machine execution request.

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

`requested_at` is caller-supplied request evidence. Current authority validity MUST be evaluated against verifier time at the execution fence; `requested_at` MUST NOT substitute for verifier time.

A v0.8 verifier MUST reject undeclared top-level request fields rather than interpreting them as protocol-version selectors.

A request MAY include an `extensions` object. Each extension member MUST use an implementation-declared extension identifier. Extension material is evidence/context bound to the request; it MUST NOT override or reinterpret Core actor, action, target, grant, policy, validity, ancestry, or replay semantics.

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
11. deny if any ancestor is unknown, not active, expired, not-yet-valid, or otherwise invalid;
12. for every immediate child/parent pair in the chain, require:
    - the parent explicitly permits delegation;
    - child principal equals parent principal;
    - the request actor exact-matches the referenced child grant actor;
    - child actions are a subset of parent actions;
    - child targets are a subset of parent targets;
    - child validity is fully contained by parent validity;
    - child policy digest equals parent policy digest;
13. detect ancestry cycles and fail closed; an implementation MAY enforce a declared finite ancestry-depth/resource limit, but exhausting that limit MUST DENY rather than truncate the chain;
14. validate any request extension material against the implementation's declared extension contracts; malformed or undeclared extension material MUST NOT produce ALLOW;
15. deny a nonce already consumed inside the declared replay domain;
16. atomically consume the nonce with a successful decision in production implementations;
17. return `ALLOW` only if every applicable check succeeds;
18. otherwise return `DENY`.

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

A delegated child grant is valid only when its immediate parent exists, is active/current, and explicitly permits delegation.

A delegated child grant MUST:

- bind an exact child `actor`; the child actor identifies the delegated machine and MAY differ from the parent actor;
- preserve the same `principal` as its immediate parent;
- preserve the same `policy_digest` as its immediate parent unless a separately declared future constrained-policy-inheritance profile defines otherwise;
- authorize only actions present in its immediate parent;
- authorize only targets present in its immediate parent;
- begin no earlier than its immediate parent;
- end no later than its immediate parent.

A child MUST NOT survive invalidation of any ancestor. These rules apply transitively to every descendant.

A protected execution MUST exact-match the canonical child actor.

Delegation chains MUST be cycle-free. A verifier MUST detect ancestry cycles and fail closed. An implementation MAY impose a bounded traversal depth for resource protection, but exceeding that bound MUST fail closed rather than truncate verification.

A child may permit further delegation only when its parent permits delegation; no descendant can gain delegation capability from an ancestor chain that did not permit it.

`policy_ref` remains a reference label; `policy_digest` is the normative policy binding used by Core verification.

MCP2 Core does not consult an external "latest policy" registry during verification. A ratified grant remains bound to its immutable `policy_digest` until the authority lifecycle expires, revokes, or supersedes that grant. Replacing the governing policy therefore requires an explicit authority-lifecycle change; it is not an implicit mutation of an existing grant.

## 9. Revocation

A revoked canonical grant MUST deny future verification.

Revocation of an ancestor MUST invalidate descendants prospectively.

Revocation MUST NOT erase historical receipts or historical authority records required for reconstruction.

Current eligibility and historical inspectability are distinct concepts.

## 10. Replay protection

A nonce MUST be single-use inside the declared replay domain.

Replay identity is distinct from any implementation-specific workflow/run/attempt identity. A higher-level attempt ledger MAY impose additional at-most-once rules, but it MUST NOT weaken Core nonce replay protection.

A production `ALLOW` and its nonce consumption MUST be atomic with respect to competing verification attempts.

A replayed request MUST NOT cross the protected execution boundary a second time.

## 11. Execution fence

MCP2 verification MUST occur at the enforcement boundary immediately before the protected operation, or at an equivalently strong last-responsible-moment fence.

Planning-time approval, session-start approval, or possession of an old `ALLOW` decision MUST NOT substitute for current verification where authority may have changed.

A `DENY` MUST prevent the protected operation from executing.

## 12. Canonical request encoding and fingerprints

For Draft v0.8, a portable request fingerprint MUST be computed from the complete accepted verification request using RFC 8785 JSON Canonicalization Scheme (JCS), UTF-8 encoded, then SHA-256 hashed.

Transport/parser ingress MUST reject JSON objects containing duplicate member names before they are converted to a map/object representation. This applies at every object level, including the top-level request and `extensions` members.

A verifier MUST reject values that JCS cannot canonically serialize, including non-finite numbers and invalid Unicode scalar data.

The canonicalized request MUST include the complete accepted `extensions` object. Implementations MUST NOT strip unknown extension members and then fingerprint the reduced object; undeclared or malformed members must fail validation.

Historical v0.7 fingerprints remain historical evidence and MUST NOT be rewritten to v0.8 JCS.

## 13. Receipt

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

## 14. Reconstruction

Given the canonical records and evidence applicable at the original decision time, a conforming implementation SHOULD be able to reproduce:

- the authority chain;
- grant and ancestor status as-of decision;
- the exact action and target;
- the governing policy digest;
- the original decision;
- the reason for denial when denied;
- the receipt linkage.

Reconstruction MUST distinguish historical validity from current eligibility.

## 15. Evidence profiles

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

## 16. Historical versus current trust

Across all profiles:

- evidence that was once valid MUST NOT automatically remain currently eligible;
- revocation, expiry, root compromise, provider compromise, or epoch transition MAY end current eligibility without erasing history;
- a cryptographically valid artifact from a compromised authority MUST NOT by itself establish post-compromise provenance;
- stale distributed authority MUST NOT be treated as executable current authority.

## 17. External time

An implementation declaring an external-time profile MUST treat externally assigned provider time as evidence distinct from self-asserted internal timestamps.

A single provider MUST NOT satisfy a profile whose declared threshold requires multiple providers.

Provider unavailability, disagreement, compromise, and membership rotation MUST be handled according to the declared profile rather than silently reducing the threshold.

## 18. Provider membership

An implementation declaring timestamp-provider membership epochs MUST:

- bind each provider set to a monotonic epoch or equivalent version;
- preserve historical membership for reconstruction;
- prevent a stale provider epoch from being treated as current;
- prevent current-epoch rollback;
- prevent retired-epoch resurrection;
- prevent a compromised provider from regaining current trust merely because its historical evidence still exists;
- bind replacement-provider qualification before admission when the profile requires qualification evidence.

## 19. Conformance and independent verification

MCP2 conformance is defined by the public protocol, declared profiles, schemas, and conformance vectors—not by the behavior or assertions of any single commercial implementation.

A conforming implementation MUST produce the expected deterministic verdicts for the applicable published conformance vectors.

An implementation MAY use MCPaios, but MCPaios is not the MCP2 truth authority.

## 20. Fail-closed rule

When required current authority, canonical state, cryptographic validation, threshold evidence, provider membership, or replay state cannot be established, the verifier MUST fail closed.

Unavailable evidence is not equivalent to affirmative authorization.

## 21. Extension rule

Implementations MAY add transports, storage systems, identity systems, policy languages, evidence providers, and declared request extensions.

Request extensions MUST be carried under the request's `extensions` object. The Core request fields remain closed and normative.

A conforming implementation that accepts request extensions MUST:

- publish the accepted extension identifiers and versions in its protocol/conformance declaration;
- use stable namespaced extension identifiers; reverse-DNS style identifiers or an equivalently collision-resistant registered prefix are RECOMMENDED;
- publish any supported or forbidden extension combinations and any size/depth limits;
- validate each extension independently against its declared schema before protected execution;
- require extension schemas to reject undeclared members unless that extension specification explicitly defines an open sub-object;
- bind accepted extension material into the same canonical request fingerprint/evidence used for the authority decision;
- evaluate multiple extensions monotonically and order-independently when composition is supported: every extension must validate, and any extension-specific denial wins;
- reject extension combinations whose semantics overlap or conflict with each other or with Core;
- fail deterministically when required extension material is malformed or an extension identifier is undeclared.

Extensions MUST NOT:

- weaken Core checks;
- silently reinterpret normative fields;
- override actor, action, target, grant, policy, validity, ancestry, or nonce semantics;
- turn a normative denial into an allow;
- erase historical authority needed for reconstruction;
- claim an undeclared profile or extension.

Extension-specific rules MAY add additional DENY conditions but MUST NOT make Core more permissive.

An implementation MAY support only one request extension per protected operation if that limitation is declared. A consequential operation nested inside another governed operation (for example, an MCP tool invoked from a model leg) SHOULD cross its own authority fence when it is independently consequential rather than inheriting the enclosing operation's ALLOW.

Request extensions are evidence/context, not ratification. An extension MUST NOT treat workflow approval, task completion, a Spec Kit gate, model rationale, or other planning/process state as MCP2 authority.

The MCP2 request-extension mechanism is independent of the Model Context Protocol (MCP) extension-negotiation mechanism. Sharing the word "extension" does not create negotiation or conformance coupling.

## 22. Non-claims

Draft v0.8.0 does not claim:

- global Byzantine consensus;
- protection against every colluding majority;
- trusted hardware time;
- RFC 3161 compliance unless separately implemented and declared;
- universal identity semantics;
- a particular transport, database, cloud, model provider, or agent framework.

MCP2 specifies bounded machine authority and its proof obligations. Operational deployment choices remain implementation responsibilities.
