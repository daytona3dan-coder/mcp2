# MCP2 v0.8 Reconciliation Work Item

**Status:** AUTHORIZED DEVELOPMENT / DRAFT — not yet a protocol ratification  
**Opened:** 2026-09-22  
**Base:** MCP2 main `53449d56eb98b3e4e87d94bddfd9ad7a99366d69`  
**Frozen predecessor:** Candidate v0.7.0 at `a85e3b81ed2bb7eb497592ec49b5f63aab2be94e`

## Purpose

Reconcile the frozen MCP2 Candidate semantics, the public reference/clean-room implementations, the executed proof corpus, and the current MCPaios product before PayMAXAIOS or any other new consequential system depends on the boundary.

This work MUST NOT rewrite Runs Five through Twenty-Five. Those runs remain closed historical evidence. Any changed semantics belong in a new protocol version, new vectors, and new qualification evidence.

## Confirmed baseline

MCP2 v0.7.0 currently defines bounded, revocable, receipted machine authority around:

`RATIFY → GRANT → VERIFY → FENCE → EXECUTE → RECEIPT → RECONSTRUCT`

Core invariants retained for v0.8 work:

1. caller-supplied grant contents are never authoritative;
2. current canonical authority is resolved by `grant_id`;
3. actor, action, target, validity, policy digest, ancestry, revocation, and replay are checked before ALLOW;
4. verification occurs at the last responsible moment before protected execution;
5. DENY prevents protected execution;
6. successful ALLOW nonce consumption and decision evidence are atomic in production implementations;
7. historical evidence remains reconstructible after current authority changes;
8. fail closed when required authority cannot be established.

## Reconciliation findings

### R1 — Delegation semantics are not expressed consistently

The frozen public artifacts do not all enforce the same delegation rules.

- `algorithms/delegate.md` requires an active/current parent, delegation permission, action/target/time narrowing, and governing-policy digest equality.
- Run Eleven / historical MCPaios identity-authority code additionally preserves parent principal and policy when creating a child.
- `SPECIFICATION.md` §8 currently states action/target/time narrowing and ancestor invalidation, but does not explicitly state the `delegation.allowed`, principal, or parent/child policy-equality rules.
- The public reference and clean-room verifiers currently enforce ancestry status/action/target/time but not all of the stronger Run Eleven/delegate-algorithm rules.
- Current product MCPaios must be separately reconciled after the protocol rule is ratified.

### Proposed v0.8 core rule

For a delegated child under `MCP2-CORE`:

1. the immediate parent MUST exist, be active, and be current;
2. the immediate parent MUST explicitly permit delegation;
3. the child's `principal` MUST equal the parent's `principal`;
4. child `actions` MUST be a subset of parent `actions`;
5. child `targets` MUST be a subset of parent `targets`;
6. child validity MUST be fully contained by parent validity;
7. child `policy_digest` MUST equal parent `policy_digest`;
8. policy-reference semantics MUST be made explicit before candidate freeze;
9. every descendant MUST satisfy the same rules transitively at verification time.

A future constrained-policy-inheritance profile MAY allow a child to bind a narrower policy, but no such profile exists in this work item. Financial sub-allocation is not smuggled into MCP2 Core.

### R2 — `superseded` exists in the public grant schema but needs normative semantics

The public Authority Grant schema already permits:

- `active`
- `revoked`
- `superseded`

v0.8 must state explicitly:

- only `active` grants are currently executable;
- `revoked` and `superseded` grants DENY future verification;
- supersession does not erase or rewrite historical receipts;
- whether supersession requires a dedicated record/event shape is an implementation choice unless a future protocol record is standardized.

### R3 — Implementation-defined request extensions need a clean conformance boundary

MCP2 v0.7 says implementations may add extension fields and must declare implementation-defined extension fields, while the core verification-request JSON Schema is closed with `additionalProperties: false`.

Operational MCPaios already binds additional context for specific protected integrations (for example MCP-tool and multi-model execution context). The next candidate must remove ambiguity without weakening Core.

Required v0.8 decision:

- either define a namespaced `extensions` container in the protocol request shape; or
- define a precise projection rule under which an implementation may carry declared extension material outside the Core schema while Core conformance is evaluated against the canonical Core projection.

No new extension field may:
- override actor/action/target/grant/policy/nonce semantics;
- convert a Core DENY into ALLOW;
- evade replay protection;
- become authoritative merely because a caller supplied it.

The current MCP 2026-07-28 extensions framework is relevant prior art, but MCP2 will not copy it mechanically. MCP2 remains its own authority protocol.

### R4 — Attempt identity must remain distinct from replay identity

MCP2 Core provides a replay nonce. Current MCPaios also has a durable attempt ledger for its multi-model orchestration primitive.

Those are not the same abstraction.

v0.8 must preserve the distinction:

- `nonce`: Core replay identity inside the declared replay domain;
- implementation attempt/run identity: optional higher-level execution identity, declared and receipted by the implementation/profile that owns it.

MCP2 Core MUST NOT claim that every integration has a generic attempt ledger unless a future protocol primitive/profile defines one.

### R5 — Client/AI intent context is not authority

Recent MCP work on AI invocation audit context reinforces an existing MCP2 boundary: intent/reason metadata can explain why an action was attempted but must not create authority.

MCP2 v0.8 should retain:

**identity ≠ capability ≠ intent ≠ authority ≠ evidence**

Any integration that carries user intent, model rationale, task context, or planning artifacts must treat those as inputs/evidence, not as an ALLOW source.

## External ecosystem observations (non-normative)

As of 2026-09-22:

- MCP 2026-07-28 is a stateless per-request protocol with a formal extension framework.
- MCP Tasks is final and supplies durable async handles for long-running work.
- Skills over MCP (SEP-2640) is final.
- Structured Authorization Denials (SEP-2643), tamper-evident audit records (SEP-3004), signed capability declarations (SEP-3140), passkey-per-call approval (SEP-2672), and several execution-attestation proposals are still proposals/drafts.
- These items are watch inputs, not MCP2 dependencies. MCP2 MUST NOT adopt proposal semantics as if they were final standards.

## Spec Kit boundary

Current GitHub Spec Kit workflows are resumable, support human `gate` steps, slots, overlays, loops, fan-out/fan-in, and per-step integration configuration.

However, Spec Kit explicitly documents that workflow `shell` steps run with the user's privileges and that `requires` is advisory rather than a capability sandbox.

Therefore any future MCP2/Spec Kit bridge MUST preserve this rule:

> A Spec Kit specification, task, gate, workflow state, or completion claim may propose or evidence machine work, but it does not itself grant MCP2 authority. Consequential execution still crosses an MCPaios/MCP2 fence.

The existing MCP2 Roadmap "Spec Kit bridge" item should be interpreted as an artifact/proposal bridge, not as delegation of the authority boundary to Spec Kit.

## Required v0.8 conformance additions

Before v0.8 can move from draft to Candidate, add deterministic public vectors for at least:

1. parent delegation disabled → child invalid / verification DENY;
2. child principal differs from parent → child invalid / verification DENY;
3. child policy digest differs from parent → child invalid / verification DENY;
4. child policy equality across a multi-generation chain → exact valid request ALLOW;
5. any ancestor superseded → descendant DENY;
6. referenced grant superseded → DENY;
7. declared extension context cannot override a Core actor mismatch;
8. declared extension context cannot override a Core policy mismatch;
9. undeclared/malformed extension context follows the chosen v0.8 extension rule and fails deterministically;
10. existing v0.7 ALLOW/DENY/replay/revocation behavior remains green.

The public reference verifier and clean-room verifier must agree on every applicable v0.8 vector before Candidate freeze.

## MCPaios follow-on gate

After the v0.8 rule is ratified, MCPaios must be checked and, where necessary, changed so product issuance and verification enforce the same semantics.

At minimum inspect:

- product grant issuance;
- durable PostgreSQL authorization ancestry walk;
- grant lifecycle/status representation;
- protocol declaration;
- implementation-defined request extensions;
- reconstruction output;
- regression and database qualification.

No MCPaios production migration or live credential/grant change is authorized merely by this protocol draft.

## PayMAXAIOS dependency boundary

PayMAXAIOS remains outside MCP2's financial scope.

MCP2/MCPaios answers whether a machine may perform an exact protected action now. PayMAXAIOS answers pricing, balance, reservation/hold, financial limits, settlement/release, and financial receipts.

A paid protected action may require both systems, but neither decision implies the other.

## Acceptance for this work item

This reconciliation is ready to advance only when:

- the normative delegation rule is explicit;
- the public schemas/spec/algorithms agree;
- reference and clean-room implementations agree;
- new vectors cover the reconciled rules;
- MCPaios product behavior is mapped against those rules;
- closed historical proof records remain untouched;
- proposal-stage external MCP work is not represented as settled dependency;
- a new exact-head review package is produced before Candidate freeze.
