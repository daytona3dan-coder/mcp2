# MCP2 — Machine Authority & Evidence Profile

**Status:** Draft v0.8.0 development on this branch; Candidate v0.7.0 remains the last frozen release on main  
**Purpose:** Define and verify bounded, revocable, receipted machine authority while remaining transport- and MCP-stack-independent.

MCP2 answers one question:

> Does this machine possess valid, bounded, unrevoked authority to perform this exact action against this exact target now—and can that decision later be proven?

MCP2 is **not** MCP v2, an MCP replacement, an identity provider, or an agent orchestrator. It is an authority/evidence profile with normative protocol semantics that can be carried over MCP or other execution substrates.

## Boundary

- Identity answers **who the actor is**.
- Capability answers **what the actor can technically call**.
- Intent answers **what is proposed or expected**.
- MCP2 answers **whether the actor is authorized to perform this exact act now**.
- MCPaios is a separate operational implementation of MCP2 and is not the MCP2 truth authority.

## Core lifecycle

`RATIFY → GRANT → VERIFY → FENCE → EXECUTE → RECEIPT → RECONSTRUCT`

`REVOKE` may invalidate authority before execution.

## Profiles

- `MCP2-CORE` — canonical grant resolution, verification, delegation, revocation, replay protection, execution fencing, receipts, and reconstruction.
- Optional evidence profiles are defined in `PROFILES.md` and cover witness quorum, freshness, root epochs, external time, threshold timestamp authorities, and provider epochs.

An optional profile must not weaken an `MCP2-CORE` denial.

## Core invariants

1. Caller-supplied grant properties are never authoritative.
2. Verification resolves the canonical grant by `grant_id`.
3. Target, action, actor, validity, policy digest, ancestry, revocation, and replay state are checked before ALLOW.
4. A child grant cannot exceed or outlive its parent.
5. Revocation is prospective and transitive.
6. Unknown, malformed, expired, revoked, mismatched, replayed, or policy-divergent requests DENY.
7. Every verification decision is reconstructible from canonical records and deterministic inputs.
8. Receipts bind the decision to the grant, request, policy and result fingerprints.

## Repository map

- `CHARTER.md` — category and non-goals
- `THREAT_MODEL.md` — trust boundaries and attacker model
- `SPECIFICATION.md` — Draft v0.8.0 normative semantics on this branch
- `PROFILES.md` — conformance profiles
- `CONFORMANCE.md` — conformance requirements
- `KNOWN-LIMITATIONS-V0.7.md` — published v0.7 historical limitations without rewriting closed evidence
- `UPSTREAM-MCP-ADOPTION.md` — rule for adopting stable MCP primitives without duplicating or widening authority
- `protocol-manifest.json` — machine-readable candidate version and conformance binding
- `schemas/` — JSON Schemas for canonical records
- `algorithms/` — deterministic verification procedures
- `reference/` — executable reference and clean-room verifiers
- `test-vectors/` — normative examples
- `runs/` and `evidence/` — preserved proof corpus and public PASS evidence

## Reference verification

Requires Node.js 20+.

The Candidate v0.7.0 protocol freeze and clean-room conformance suite are executable from this repository. The machine-readable manifest binds the current candidate to the closed Runs Five through Twenty-Five proof corpus and the independent conformance vector digest.

## License and implementation

The contents of this MCP2 repository are licensed under the **Apache License 2.0**. Anyone may inspect, implement, modify, test, and redistribute MCP2 subject to that license.

This license applies to the contents of this repository only. It does **not** grant rights to separately distributed MCPaios products, hosted services, trademarks, or code in other repositories.

See `LICENSE` for the full terms.
