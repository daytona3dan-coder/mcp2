# Upstream MCP Adoption Policy

**Status:** Candidate v0.8 architecture rule  
**Scope:** MCP2 protocol evolution and MCPaios interoperability

## Principle

MCP2 does not compete with or replace Model Context Protocol (MCP).

MCP supplies the interoperability substrate used to discover, describe, negotiate, authorize access to, and invoke MCP capabilities. MCP2 supplies a separate governed machine-authority decision: whether an identified machine actor is authorized to perform an exact protected action against an exact target now, under a bounded and reconstructible grant.

When upstream MCP standardizes a primitive that MCP2 or an implementation previously had to model locally, MCP2 SHOULD consume the stable upstream primitive rather than maintain a competing substitute.

Upstream adoption MUST NOT weaken an MCP2 denial or turn upstream metadata into authority by assertion.

## Ownership boundary

### Prefer upstream MCP

MCP2 implementations SHOULD use stable upstream MCP mechanisms for:

- protocol transport and message semantics;
- client/server interoperability;
- capability and extension negotiation;
- MCP server/tool/resource discovery and invocation;
- MCP transport access authorization and enterprise identity integration;
- standardized task lifecycle and other finalized MCP execution primitives.

These are interoperability inputs. They are not MCP2 grants.

### MCP2 remains authoritative for

MCP2 defines:

- the canonical machine-authority grant;
- exact actor/action/target binding;
- exact policy/version/digest binding;
- bounded validity;
- delegation attenuation and lineage;
- prospective revocation and supersession;
- replay/single-use protection where required;
- last-responsible-moment verification;
- fail-closed ALLOW/DENY semantics;
- decision receipts and result binding;
- historical reconstruction of why execution was or was not authorized.

MCP2 does not become an identity provider, MCP transport authorization system, workflow engine, payment ledger, generic execution endpoint, or MCP replacement.

## MCP carriage

MCP2 material MAY be carried through an MCP extension or other MCP-defined extension surface.

Carriage does not create authority.

An MCP extension field, task state, capability declaration, tool descriptor, workflow result, skill, credential, access token, or server assertion MUST NOT independently produce MCP2 ALLOW.

MCP2 request extension material is monotonic:

1. it MAY add evidence or additional DENY conditions;
2. it MUST NOT override a Core actor/action/target/policy/validity/ancestry/replay denial;
3. malformed, undeclared, or unverifiable extension material fails closed when required for the attempted protected action.

MCP2 remains transport-independent: the same authority semantics may protect an MCP tool, HTTP API, database boundary, queue, local IPC boundary, model call, or other consequential target.

## Stable upstream vs proposals

Only stable/final upstream MCP behavior may become a normative dependency without a new MCP2 qualification event.

Proposal-stage MCP work—including authorization extensions, interceptor/enforcement hooks, idempotency, attestation, audit/evidence, approval, payment, workflow, sandbox, or capability semantics—may inform design but MUST NOT silently change MCP2 authority semantics.

When an upstream proposal becomes stable and overlaps an MCP2 implementation primitive:

1. record the upstream version and exact dependency;
2. define how the upstream primitive maps into MCP2 evidence;
3. prove it cannot manufacture or widen authority;
4. add conformance vectors for downgrade, omission, mismatch, replay, and stale-state cases;
5. qualify the replacement before deprecating the local primitive;
6. preserve historical receipts and reconstruction semantics.

## Adoption rule

The preferred evolution path is:

`stable MCP primitive → MCP2 evidence/input binding → MCPaios enforcement → target-owned execution`

Not:

`MCP2 duplicate of MCP primitive → MCPaios duplicate transport/runtime → target`

## Payment boundary

Financial authorization remains separate.

For paid protected actions:

- MCP2 answers whether machine authority is valid.
- MCPaios enforces the authority decision at the target boundary.
- PayMAXAIOS (or another financial system) owns quote, hold/reservation, settlement, release, reconciliation, and financial evidence.
- A valid payment reservation does not imply MCP2 authority.
- MCP2 ALLOW does not imply sufficient financial capacity.
- The target requires both when both are prerequisites and binds their evidence without merging their truth domains.

## Compatibility promise

MCP2 may adopt more upstream MCP over time without changing its governing question:

> Does this machine possess valid, bounded, unrevoked authority to perform this exact action against this exact target now—and can that decision later be proven?
