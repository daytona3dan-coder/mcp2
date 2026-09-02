# MCP2 Run Ten — Intent → Authority → Execution — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Protected external system:** GitHub  
**Operational authority implementation:** MCPaios  
**Structured intent source:** Spec Kit-compatible intent artifacts

## Result

Run Ten demonstrated the constitutional rule:

> **Specification is not authority.**

Structured intent could describe requested GitHub work, but it could not create execution authority. Human ratification bound MCP2 authority to the exact canonical intent digest. When the specification changed, the old grant remained historically unchanged but could no longer authorize execution against the new current intent. Fresh human ratification was required.

## Private MCPaios proof

MCPaios workflow run: `33673121586`

Private implementation PR #2 merged at:

`ffa7957ad2c17b432da04c84512684f9952f24da`

The combined regression/acceptance gate reported:

- Run Eight regression: 16/16 PASS.
- Run Ten intent-authority cases: 16/16 PASS.
- Combined `npm test`: **32/32 PASS, 0 failed**.
- Independent Run Ten rerun: **16/16 PASS, 0 failed**.

The Run Ten cases proved:

1. Spec Kit intent intake is non-authoritative.
2. Execution before ratification is denied.
3. Human ratification binds the exact current intent digest.
4. Ratification cannot expand actions beyond intent.
5. Ratification cannot expand target scope.
6. Exact ratified action is allowed.
7. Out-of-grant action is denied.
8. Specification change creates a new intent revision/digest.
9. Specification change invalidates use of the old grant without rewriting it.
10. A stale digest cannot be ratified after the change.
11. Revocation independently denies execution.
12. Fresh human ratification binds the revised intent.
13. Revised authority accepts only the revised current intent.
14. Tampered supplied intent is denied.
15. Reconstruction links intent evidence and authority evidence.
16. Signed MCP2 authority bundles carry the exact intent binding.

## External signed-artifact proof

Disposable proof repository: `daytona3dan-coder/mcp2-github-proof`

Read-only verification workflow run: `33673531330`

Result: **10/10 PASS**.

Intent digests:

- v1: `1bcd70fb3540237fd0bd7e14e859285fd9da8decb6e9652983e32ddf0607cebb`
- v2: `8bf117f45e19d4c256bfcf29b0ff9df6363669cec9be13ee442fda3ec3a086bf`

Static evidence artifact: `mcp2-run-ten-static-evidence`, artifact ID `9863443365`.

GitHub Actions artifact ZIP SHA-256:

`24ebd472bdd69d4f1926c6fde388a9e0edcb0beeaa0e0db2a6d3a7e89258fe71`

The proof-only signing private key was never committed. Only its public Ed25519 verification key and signed authority envelopes were stored.

## Live GitHub proof

The connected GitHub execution plane performed protected mutations only after the corresponding signed intent-bound authority decision was ALLOW.

### v1

Before human ratification: **DENY**. No protected GitHub mutation was invoked.

After v1 human ratification:

- branch created: `run-ten-live-v1-20260902`
- exact v1 content commit: `6528d9ee272a065d8cc1edf6ef7969e139952fd6`

### Specification change

The current intent changed from v1 to v2.

The still-active v1 grant was evaluated against v2 and returned **DENY** because the current intent digest no longer matched the digest bound into the grant. No protected GitHub mutation was invoked under the stale authority.

### v2 fresh ratification

A fresh v2 human-ratified grant bound the new digest and permitted execution:

- branch: `run-ten-live-v2-20260902`
- exact v2 content commit: `0edc8a81894f24c69ba624fb61d710d484b36f38`
- proof PR: #5
- authorized merge commit: `6726fcb33c23b956e05a490d9c96b049bfdac2cf`

The merged `main` file `run-ten-proof.txt` was read back and contained:

`MCP2 Run Ten authorized content v2`

### Independent revocation and scope denial

The revoked v1 grant was evaluated against its original v1 intent and returned **DENY**. No protected mutation was invoked.

A deployment request under the v2 grant returned **DENY** because deployment was outside both the structured intent and grant. No deployment mutation was invoked.

## Proof preservation

Run Ten proof artifacts, verifier, workflow, and evidence were preserved in `mcp2-github-proof/main` at merge commit:

`e9cbfcae9c38b4d87df78c41a0e1c6eeb289d860`

## Security significance

Run Ten closes the gap between structured requirements and machine execution:

`Intent → Human Ratification → MCP2 Authority → MCPaios → Execution Fence → GitHub → Receipt/Reconstruction`

A changed specification does not silently mutate or refresh authority. Authority is independently granted, bounded, revocable, and bound to the exact intent digest that a human approved.

## Non-claims

Run Ten does not claim:

- production Spec Kit service integration;
- production MCPaios network deployment;
- enterprise identity federation;
- HSM-backed production signing keys;
- generalized policy coverage for every GitHub endpoint;
- automatic deployment authority.

Run Ten proves the narrower critical property that **structured intent can propose machine action, but only separately ratified MCP2 authority can permit real execution against the current approved intent.**
