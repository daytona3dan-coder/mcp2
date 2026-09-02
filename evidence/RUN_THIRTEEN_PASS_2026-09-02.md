# MCP2 Run Thirteen — Multi-Tenant Authority Isolation — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios  
**Protected boundary:** deployed multi-tenant authority plane

## Result

Run Thirteen proved:

> **Tenant A authority cannot become Tenant B authority.**

MCPaios now derives tenant identity from authenticated credentials before authority evaluation. A caller cannot select or override an authoritative tenant through request fields. Principals, targets, grants, delegation ancestry, revocations, receipts, event chains, and signing state are independently tenant-scoped.

Private MCPaios Run Thirteen PR #5 merged at:

`b1e5ce35c536a861d2e1a8e3ec2607e440e48260`

## CI evidence

Final tested code head:

`b29e9bfe18f41c22d66b74e66945f6c0cb5afe2f`

All required workflows passed on that exact code head:

- Run Eight regression — SUCCESS (`33683613175`)
- Run Ten regression — SUCCESS (`33683613241`)
- Run Eleven regression — SUCCESS (`33683613154`)
- Run Thirteen tenant isolation — SUCCESS (`33683613217`)

The only subsequent branch change before merge was the Run Thirteen evidence document.

## Structural tenant boundary

The deployed Run Thirteen authority model uses:

- independent per-tenant ledger state and ledger heads;
- tenant-scoped principals and targets;
- grant identity `(tenant_id, grant_id)`;
- same-tenant composite parent linkage for delegation;
- tenant-scoped revocations and decision receipts;
- separate active signer state per tenant;
- bearer credentials that resolve tenant and subject server-side;
- deny-by-default RLS with direct anon/authenticated table access revoked.

The previous pre-tenant `/v1` network authority routes were retired. The tenant-derived authority surface is `/v2`.

## Live proof

The accepted live proof used two isolated tenants in the same deployed authority database. Each tenant had a different human operator, workload identity, delegated child workload, owned target, credential set, ledger head, and signing state.

The deployed authority function was exercised on version 4, then redeployed as version 5 without resetting canonical database state.

### Phase 1 — 15/15 PASS

1. The `/v2` tenant authority plane was healthy.
2. Legacy `/v1` authority execution was retired.
3. Tenant A and Tenant B independently created the **same grant ID** without collision.
4. Each tenant's workload successfully executed its own tenant authority — ALLOW.
5. Tenant A could not ratify authority over Tenant B's target.
6. Tenant A could not ratify Tenant B's workload as actor.
7. Tenant A authority could not execute against Tenant B's target — DENY.
8. A Tenant-B-only grant appeared as `UNKNOWN_GRANT` from Tenant A, avoiding cross-tenant existence disclosure.
9. Tenant B could not revoke Tenant A's authority.
10. Same-tenant bounded parent → child delegation succeeded.
11. Tenant A could not name Tenant B's grant as a delegation parent.
12. Tenant A could not delegate authority to Tenant B's workload.
13. Tenant A and Tenant B received tenant-bound signed authority bundles with different signer public keys.
14. Rotating Tenant A's signer did not rotate Tenant B's signer, and each tenant audit surface contained only its own state.
15. Revoking Tenant A's parent transitively caused its child authority to return DENY / `ANCESTOR_INVALID`.

### Phase 2 — fresh compute — 1/1 PASS

The authority function was redeployed without resetting the database.

On the fresh compute instance:

- Tenant B's previously issued authority remained **ALLOW**;
- Tenant A's child remained **DENY / ANCESTOR_INVALID** because its parent was revoked;
- both tenant signer identities persisted independently;
- both audit views remained tenant-scoped.

Total live acceptance: **16/16 PASS**.

## Isolation integrity

Post-proof integrity checks reported:

- cross-tenant target references: `0`
- cross-tenant principal/actor references: `0`
- cross-tenant parent references: `0`
- Tenant A hash-chain link errors: `0`
- Tenant B hash-chain link errors: `0`
- each tenant ledger head matched its own final event hash
- anon direct grant-table access: denied
- authenticated direct grant-table access: denied

After cleanup, both proof tenants had:

- `0` active proof API credentials;
- `0` active proof grants;
- independently preserved ledger histories and signer state.

## Cleanup

All temporary proof credentials and remaining proof grants were revoked after acceptance. The one-time challenge transport and temporary `pg_net` caller were removed. The proof-only Edge Function was redeployed as a JWT-protected 410-only closed endpoint. The production tenant authority service remained active.

The final Supabase security-advisor scan contained **no WARN or ERROR findings**. Remaining INFO notices reflect the intentional deny-by-default RLS configuration with no anon/authenticated policies.

## Superseded transport attempt

An earlier proof invocation used the proof caller's default 5-second HTTP timeout. The caller timed out while the server-side matrix continued. That attempt was excluded from acceptance. The caller timeout was increased and the complete proof was restarted under a fresh proof ID. Any authority created by the superseded attempt was revoked during cleanup.

This was a proof-transport defect, not an authority-isolation failure.

## Security significance

Run Thirteen extends the proven MCP2 boundary to shared infrastructure:

`Authenticated credential → server-derived tenant → tenant-local MCP2 authority → tenant-owned target → tenant-local receipt/evidence`

A machine may be authenticated and technically capable, but it cannot borrow another organization's authority, target ownership, delegation ancestry, audit history, or signer state.

Run Thirteen adds the constitutional rule:

> **Tenant A authority ≠ Tenant B authority.**

## Non-claims

Run Thirteen does not claim:

- enterprise billing or organization provisioning UI;
- geographic isolation between tenants;
- cross-region replication;
- generalized cloud tenancy adapters;
- HSM-backed production signing;
- production customer onboarding.

Run Thirteen proves the narrower critical property that multiple organizations can coexist in one deployed MCPaios authority plane without one tenant's authority becoming another tenant's.
