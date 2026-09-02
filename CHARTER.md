# MCP2 Charter — Candidate v0.6.0

## Category

**MCP2 — Machine Authority Protocol**

MCP2 standardizes authority semantics for machine execution.

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

MCPaios is an operational system that may implement MCP2. MCP2 must remain independently inspectable and implementable.

## Security posture

Default decision is `DENY`.

No caller may self-assert the authoritative scope, policy, target, action, ancestry, status or validity of a grant.
