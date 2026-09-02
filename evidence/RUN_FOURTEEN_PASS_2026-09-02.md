# MCP2 Run Fourteen — Authority Recovery & Disaster Reconstruction — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios  
**Protected boundary:** deployed recovery-capable multi-tenant authority plane

## Result

Run Fourteen proved:

> **Backup is not authority. Only authenticated, anchored, non-stale recovery state may become authority again.**

MCPaios reconstructed canonical machine authority after destructive tenant-state loss without resurrecting revoked authority, stale checkpoint state, API credentials, or old operational signer authority.

Private MCPaios Run Fourteen PR #6 merged at:

`d1962c4ef014b7e713f9bead7df10c7d63c0f99c`

## CI evidence

Final tested code head:

`dbdbf88c6b128394989c6cd25584c414e19542c2`

All required checks passed on that exact head:

- Run Eight — SUCCESS
- Run Ten — SUCCESS
- Run Eleven — SUCCESS
- Run Thirteen — SUCCESS
- Run Fourteen — SUCCESS

The only subsequent branch change before merge was the Run Fourteen deployed evidence document.

## Recovery model

Run Fourteen added:

- authenticated recovery checkpoints;
- HMAC-bound checkpoint packages;
- a Vault-held recovery authentication root;
- monotonic recovery epochs;
- a recovery anchor identifying the current restorable checkpoint;
- stale-checkpoint rollback rejection;
- destructive-test scoping restricted to `recovery-*` tenants;
- canonical restoration of principals, targets, grants, revocations, receipts, and event chains;
- historical signer public-key preservation as retired metadata only;
- deliberate exclusion of API credentials from recovery;
- mandatory fresh operational signer creation after restore.

## Live destructive proof

Accepted proof ID: `r14-20260902b`.

Two isolated recovery tenants were used:

- `recovery-a`
- `recovery-b`

### Phase 1 — 15/15 PASS

1. Both recovery tenants were created in isolated tenant namespaces.
2. Both tenants received bounded grants.
3. Both tenants created real Vault-backed signer state.
4. Both grants initially verified **ALLOW** through the deployed `/v2` authority plane.
5. Stale checkpoint `CP-R14-r14-20260902b-STALE` was captured at epoch `1` while recovery-a was active.
6. Recovery-a was revoked; its next verification returned **DENY / GRANT_NOT_ACTIVE**, while recovery-b remained **ALLOW**.
7. Current checkpoint `CP-R14-r14-20260902b-CURRENT` advanced the recovery anchor to epoch `2`.
8. Tampered checkpoint material failed authentication.
9. Both recovery tenants were actually deleted from canonical Run Thirteen authority tables.
10. Restore of the stale epoch-1 checkpoint was rejected with `MCPAIOS_RECOVERY_STALE_CHECKPOINT`.
11. Restore of the anchored epoch-2 checkpoint succeeded.
12. Immediately after restore, no API credentials and no active operational signers had been restored.
13. Recovery-a's grant reconstructed as revoked; recovery-b's grant reconstructed as active.
14. Each `RECOVERY_RESTORED` event continued from the checkpoint ledger head.
15. Fresh credentials and fresh signer identities were created; recovery-a remained **DENY**, recovery-b returned **ALLOW**.

Pre-disaster signer identities:

- recovery-a: `signer-20260902213336196`
- recovery-b: `signer-20260902213336905`

Fresh post-recovery signer identities:

- recovery-a: `signer-20260902213340255`
- recovery-b: `signer-20260902213340936`

The post-recovery signer IDs differed from the checkpoint-era signer IDs, proving signer authority was not simply resurrected from backup.

### Phase 2 — fresh authority compute — 1/1 PASS

The production authority function was redeployed from version `5` to version `6` without resetting the recovered database.

On fresh compute:

- recovery-a remained **DENY / GRANT_NOT_ACTIVE**;
- recovery-b remained **ALLOW**;
- both event chains reported zero link errors;
- both recovered tenants retained fresh active signer state.

Total live acceptance: **16/16 PASS**.

## Recovery anchor evidence

Final recovery anchor:

- epoch: `2`
- checkpoint: `CP-R14-r14-20260902b-CURRENT`
- checkpoint digest: `ece7fff6c3d8e27d4d1a17e8ab708b4a2e9614b6dd094adc7a20c43820251a0b`
- checkpoint authentication: PASS
- stored checkpoints: `2`
- successful restores: `1`

The stale epoch-1 checkpoint remains preserved as historical evidence but cannot satisfy the recovery anchor.

## Final forensic state

After proof cleanup:

- recovery-a chain link errors: `0`
- recovery-b chain link errors: `0`
- cross-tenant target references: `0`
- cross-tenant actor references: `0`
- cross-tenant parent references: `0`
- active proof grants: `0`
- active proof API credentials: `0`
- each recovery tenant retained one fresh active signer and one retired historical signer
- temporary proof launcher removed
- temporary `pg_net` transport removed
- proof-only Edge Function locked closed with JWT verification
- final Supabase security-advisor pass: no WARN or ERROR findings

## Deployment defect found and repaired

The first live attempt failed before checkpoint creation because the recovery-tenant validator accidentally required at least two characters after `recovery-`, excluding the approved IDs `recovery-a` and `recovery-b`.

The disposable pre-checkpoint state was deleted, the validator was repaired, and the complete destructive proof restarted under a fresh proof ID. No failed-attempt checkpoint entered the recovery anchor.

## Security significance

Run Fourteen adds the constitutional rule:

> **Backup ≠ Recoverable Authority unless it satisfies the recovery anchor.**

The proven stack now includes:

- Specification ≠ Authority
- Identity ≠ Authority
- Capability ≠ Authority
- Authority ≠ Process State
- Tenant A Authority ≠ Tenant B Authority
- Backup ≠ Recoverable Authority unless anchored and authenticated

## Non-claims

Run Fourteen does not claim cross-cloud replication, provider-wide disaster recovery, geographic failover, production RTO/RPO guarantees, HSM escrow, or production backup operations. It proves the narrower critical authority property that destructive canonical-state loss can be recovered without rolling back revocations or resurrecting obsolete machine authority.
