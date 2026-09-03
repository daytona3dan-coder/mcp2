# MCP2 Production Authority Lifecycle — PASS

Date: 2026-09-03
Implementation: MCPaios
Protocol pin: MCP2 `0.7.0-candidate`, profile `MCP2-CORE`

## Verdict

**PASS — a complete bounded machine-authority lifecycle was demonstrated in production.**

Demonstrated sequence:

`Machine proposes → Human ratifies → Machine issues bounded grant → Fence verifies → Durable ALLOW receipt → Harmless local execution → Completion receipt → Reconstruction → Human revokes → Same fence request DENY → No execution → Denial reconstruction → Temporary machine credentials retired.`

This is an implementation evidence record. It does not expand the MCP2 threat model or claim universal production readiness.

## Bounded authority under test

The production smoke grant was intentionally narrow:

- grant ID: `MCPAIOS-PROD-SMOKE-001`
- action: `demo.echo`
- target: `urn:mcpaios:demo:echo`
- policy digest: `9c64bdfb938c8d57ded5c8ab120cc378fcd4bbf753faf928692c6bf1f5e5f6d4`
- validity: `2026-09-03T20:00:00Z` through `2026-09-10T20:00:00Z`

No remote protected target was used. The execution step was a harmless local echo on a GitHub Actions runner.

## Proposal and ratification

A production operator machine submitted the bounded proposal.

Proposal digest:

`f50edffc6291f5b50023163aa7359ebba56a94d9d71ea795673230db061ae53a`

The proposal persisted as `pending`; no grant existed and nothing executed.

An authenticated human owner then ratified the exact proposal in the MCPaios Control Plane. Ratification did not itself create a grant or execute an action.

The machine subsequently issued only the exact ratified grant. The grant became `active` and remained bound to the same action, target, policy digest, validity window, and proposal digest.

## Production fence and receipted ALLOW

A separate production fence identity requested authorization for the exact grant/action/target/policy tuple with a fresh request ID and nonce.

The verifier returned a durable `ALLOW` receipt before execution was permitted.

Evidence:

- decision: `ALLOW`
- reasons: none
- nonce consumed exactly once
- request fingerprint: `c0f611a0947dcf24578564770b68792cf7f818443516fdffffd47e01345ad636`
- grant fingerprint: `d69c318e071618c441cdcc2c7ef8e19fa52d72909f1dab46ae658196d08ef3cf`
- decision fingerprint: `66c69535db2cfa71017cdfb5be0b993bc469e3e9c8309d58c9c9caf3736512b4`
- MCP2 version: `0.7.0-candidate`
- MCP2 commit: `a85e3b81ed2bb7eb497592ec49b5f63aab2be94e`
- profile: `MCP2-CORE`
- verifier: `mcpaios-product-verifier/1`

Only after the durable ALLOW receipt existed did the local `demo.echo` step execute.

Completion evidence:

- status: `SUCCESS`
- source: `external-fence`
- result fingerprint: `16bc57a040770afd1bc035e0f2114674735732f54fb29b961a996e0802f61ab5`
- error: none

Reconstruction reproduced the request, authority snapshot, active grant, ratification binding, authenticated fence binding, decision receipt, completion evidence, result fingerprint, and protocol binding.

## Human revocation

The human owner then revoked the smoke grant through the MCPaios Control Plane.

The revocation changed the authority state while preserving the prior successful receipt and completion evidence.

After revocation, the authority ledger was:

- Revision: `17`
- Sequence: `17`
- ledger head: `97686fd0f92f31b88615009e4e724d8c6ba4f573b5cac93db01cd75d95d9a32b`

## Same request class after revocation

The same production fence workflow was run again with a fresh request ID and nonce against the now-revoked grant.

The workflow stopped at its ALLOW gate. Its later execution and completion steps were skipped.

Production evidence:

- decision: `DENY`
- reason: `GRANT_NOT_ACTIVE`
- local execution: not performed
- completion: none
- result fingerprint: none
- decision fingerprint: `90c9b04164c419b7752803943a2a784fd0ddcb6b90f1ba5b8ce4d1e20c25054e`
- authority snapshot revision: `17`

The GitHub workflow concluded as a failure because the smoke client is intentionally written to require `ALLOW`. In this post-revocation case, that red workflow result is the desired fail-closed behavior rather than an authority-service failure.

Reconstruction showed the grant as revoked and preserved the revocation timestamp, request, ratification binding, fence binding, protocol pin, and `GRANT_NOT_ACTIVE` denial reason.

## Evidence-plane separation

The demonstrated implementation separates authority-state changes from evidence receipts:

- authority-changing events advance the authority ledger;
- verification and completion records preserve evidence against a pinned authority snapshot;
- receipts and completions remain reconstructible without themselves mutating authority state.

This production proof exercised both planes together.

## Temporary credential retirement

After the proof completed, both temporary machine identities used for the smoke path were revoked.

Final production state:

- machine service credentials: `2` total
- active machine service credentials: `0`
- revoked machine service credentials: `2`
- smoke grant: `revoked`
- decision receipts: `2`
  - `1` ALLOW
  - `1` DENY
- execution completions: `1`
- final authority revision: `21`
- final authority sequence: `21`
- final ledger head: `f7df270470f66e2b22eb1ea0b1865a885aad47b7d19fb37bd1f64e543d850bf4`

The temporary plaintext machine secrets are not included in this record.

## Implementation references

Relevant MCPaios implementation merges include:

- Human Service RPC short-name repair: `3a35b2b8e4c9cc0d3d5c9af236dc9c07b00c5465`
- Production Fence Smoke v1: `aae68a4c2f0ffa85bb03131eadd50ebfb23726e1`
- Private complete production evidence record: `1d42f59880031f21987495978b5a442d9774376a`

The fence client gate passed `132/132` MCPaios tests and all preserved regression workflows before merge.

## Established claims

For this bounded production case, the implementation demonstrated that:

1. a machine can propose authority without obtaining it;
2. human ratification is a separate gate;
3. the machine can issue only the ratified bounded grant;
4. an authenticated fence must verify the exact request against current authority;
5. a durable decision receipt exists before execution crosses the fence;
6. exact ALLOW permits the bounded action;
7. completion evidence binds back to the same decision receipt;
8. the record can later be reconstructed;
9. human revocation changes current authority immediately;
10. the same later request is denied after revocation;
11. denial prevents execution and produces reconstructible evidence;
12. prior successful evidence remains preserved after revocation;
13. temporary machine credentials can be retired after the proof.

## Nonclaims

This proof does not claim:

- arbitrary remote target execution safety;
- protection against every compromised infrastructure dependency;
- Byzantine consensus among external providers;
- hardware-backed trusted time;
- that every possible machine integration is production-ready;
- any expansion of the MCP2 Candidate threat model.

## Closing statement

The production lifecycle demonstrated the MCP2/MCPaios operating promise for this bounded case:

**Bounded before execution. Revocable during execution. Receipted after execution. Reconstructible later.**
