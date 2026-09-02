# MCP2 Run Nine — GitHub Authority Proof — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Protected external system:** GitHub  
**Disposable proof repository:** `daytona3dan-coder/mcp2-github-proof` (private)

## What Run Nine proved

Run Nine demonstrated that possession of GitHub API capability does not itself constitute authority.

A GitHub Actions workflow held technical write capability for repository contents, pull requests, and deployments. A signed MCP2 authority verifier independently decided whether each requested GitHub operation was authorized before the protected mutation call could occur.

The accepted live progression was:

1. LEVEL 1 signed grant verified.
2. Real repository read — ALLOW.
3. Branch creation under LEVEL 1 — DENY before mutation.
4. LEVEL 3 escalation grant verified.
5. Real branch creation — ALLOW.
6. Real repository content modification — ALLOW.
7. Pull-request creation under LEVEL 3 — DENY before mutation.
8. LEVEL 4 escalation grant verified.
9. Real pull-request creation — ALLOW.
10. Revoked LEVEL 4 grant attempted merge — DENY before mutation.
11. Independent LEVEL 5 grant verified after revocation.
12. Real pull-request merge — ALLOW.
13. LEVEL 6 deployment — DENY even though the workflow token possessed GitHub deployment capability.
14. Receipts bound actual GitHub objects and commit results.
15. Every DENY path recorded zero protected GitHub mutation calls.
16. The decision record reconstructed the complete authority progression.

Final workflow verdict: **RUN NINE PASS 16/16**.

## Concrete evidence

Accepted workflow run: `33669677541`

Accepted proof bootstrap head: `8106927c5cc44397fe43a3b878e86d185d762f62`

GitHub authority proof PR: `#2 — Run Nine authority proof 33669677541`

The PR was created by `github-actions[bot]` only after LEVEL 4 returned ALLOW.

Proof PR merge commit: `a533fd3efca2459b9f63faa0b48d9475d9c4d605`

Run Nine harness/PASS record preservation merge: `99043b7768c928ff80b1238f1212a48d6d8ccce6`

GitHub Actions evidence artifact: `mcp2-run-nine-evidence`, artifact ID `9861976649`

Artifact ZIP SHA-256 reported by GitHub Actions:

`81b9d76347e7a6693d4b9d76ce6290b9c9e98718445b08c235cf8d32aef7c07c`

The evidence artifact was successfully uploaded after the 16/16 execution proof.

## Capability versus authority

The accepted workflow token had:

- repository contents write capability;
- pull-request write capability;
- deployment write capability.

MCP2 authority still prevented unauthorized escalation. In particular, LEVEL 5 merge authority did not imply LEVEL 6 deployment authority. No deployment mutation occurred.

This is the core Run Nine result:

> Technical capability existed, but execution occurred only when the exact signed MCP2 grant authorized the exact GitHub action against the exact target.

## Revocation proof

Run Nine explicitly revoked the LEVEL 4 authority after pull-request creation. A merge attempt under that revoked authority was denied before any GitHub merge mutation call.

A separate LEVEL 5 grant was then verified and permitted the real merge.

This demonstrates prospective revocation at a real third-party execution boundary rather than only inside an MCP2-owned test surface.

## Failed first attempt

The first live workflow attempt reached and passed the first eight authority checks, including real repository read, real branch creation, real content modification, and the expected DENY gates.

GitHub then rejected pull-request creation because the repository-level setting permitting GitHub Actions to create pull requests was disabled. That was a GitHub capability/configuration failure, not an MCP2 ALLOW/DENY failure.

The partial recovery PR was closed unmerged and is not accepted as Run Nine evidence. After the repository setting was enabled, the proof was restarted from a fresh workflow run and completed 16/16.

## Proof boundary

Run Nine does **not** claim:

- production GitHub App deployment;
- enterprise identity federation;
- generalized policy coverage for every GitHub endpoint;
- HSM-backed production MCPaios signing keys;
- LEVEL 6 deployment execution;
- production MCPaios network availability.

Run Nine proves the narrower and important property that MCP2/MCPaios authority can independently govern progressively more consequential actions against a real external execution system while preserving revocation, zero-mutation DENY behavior, receipts, and reconstruction.
