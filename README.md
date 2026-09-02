# MCP2 — Machine Authority Protocol

**Status:** Candidate v0.6.0  
**Purpose:** Define and verify bounded, revocable, receipted machine authority.

MCP2 answers one question:

> Does this machine possess valid, bounded, unrevoked authority to perform this exact action against this exact target now—and can that decision later be proven?

MCP2 is **not** MCP v2, an MCP replacement, an identity provider, or an agent orchestrator.

## Boundary

- Identity answers **who the actor is**.
- Capability answers **what the actor can technically call**.
- Intent answers **what is proposed or expected**.
- MCP2 answers **whether the actor is authorized to perform this exact act now**.
- MCPaios is an operational implementation of MCP2.

## Core lifecycle

`RATIFY → GRANT → VERIFY → FENCE → EXECUTE → RECEIPT → RECONSTRUCT`

`REVOKE` may invalidate authority before execution.

## Candidate invariants

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
- `SPECIFICATION.md` — candidate normative semantics
- `schemas/` — JSON Schemas for canonical records
- `algorithms/` — deterministic verification procedures
- `reference/` — executable reference verifier
- `test-vectors/` — normative examples
- `runs/run-five/` — protected-resource proof plan

## Run reference verifier

Requires Node.js 20+.

```bash
cd reference
npm test
npm run vectors
```

No external dependencies are required.

## License and implementation

The contents of this MCP2 repository are licensed under the **Apache License 2.0**. Anyone may inspect, implement, modify, test, and redistribute MCP2 subject to that license.

This license applies to the contents of this repository only. It does **not** grant rights to separately distributed MCPaios products, hosted services, trademarks, or code in other repositories.

See `LICENSE` for the full terms.
