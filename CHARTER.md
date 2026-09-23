# MCP2 Charter — Draft v0.8.0

## Category

**MCP2 — Machine Authority & Evidence Profile**

MCP2 standardizes bounded machine-authority and evidence semantics for consequential execution. Its normative records and verifier behavior form a transport-independent protocol profile; MCP remains the preferred interoperability substrate where applicable.

## Normative question

A conforming verifier determines whether a specific actor is authorized, at a specific time, under a specific policy, to perform a specific action against a specific target.

## Non-goals

MCP2 does not define:

- transport
- model context exchange
- workload identity
- authentication
- OAuth
- token exchange
- general policy languages
- orchestration
- tool discovery
- model selection
- resource custody

These systems may provide inputs to MCP2 but do not substitute for authority verification.

## Product relationship

MCPaios is the operational product implementation developed alongside MCP2. MCP2 must remain independently inspectable and implementable, and MCPaios MUST NOT become MCP2's truth authority merely by implementation assertion.

PayMAXAIOS or another financial system may be a prerequisite for a paid protected action, but pricing, balances, holds, settlement, and financial ledgers remain outside MCP2's authority semantics.

## Security posture

Default decision is `DENY`.

No caller may self-assert the authoritative scope, policy, target, action, ancestry, status or validity of a grant.
