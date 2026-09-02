# MCP2 Run Twelve — Durable Deployed Authority Plane — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios  
**Deployment:** Dedicated Supabase authority project in `us-east-1`

## Result

Run Twelve proved:

> **Authority is not ephemeral process state.**

MCPaios authority was moved from proof-local/process memory into a deployed transactional authority plane backed by PostgreSQL and protected signer custody. The network compute layer was replaced twice during the proof without resetting canonical authority state.

Private MCPaios Run Twelve PR #4 merged at:

`b50a34f85c127e1eb59d9f52b3bd57da9877fd5a`

## What was proven

1. A dedicated MCPaios authority project was created and reached healthy state.
2. The durable authority schema installed transactionally.
3. Direct anon/authenticated access to canonical authority tables remained denied.
4. Network operator/device authentication used bearer credentials whose database records contain only hashes.
5. A real grant was ratified through the deployed HTTPS authority API.
6. The exact bounded request returned **ALLOW** and produced a durable receipt.
7. The service generated a Vault-backed Ed25519 signer and returned a signed complete authority bundle.
8. The authority Edge Function was redeployed from version 1 to version 2; the preexisting grant remained valid and returned **ALLOW** from the new compute instance.
9. The grant was remotely revoked through the deployed API.
10. The immediately following verification returned **DENY / GRANT_NOT_ACTIVE**.
11. The authority signer was rotated; the previous signer became retired and a new signer became active.
12. The authority function was redeployed again to version 3; revoked authority remained **DENY** and the rotated signer remained active.
13. Exact request replay returned deterministic **DENY / REPLAY**.
14. Two concurrent ratifications for the same grant produced exactly one success and one `MCPAIOS_GRANT_ALREADY_EXISTS`, demonstrating serialized authority mutation.
15. The final durable event chain had zero linkage errors.
16. Temporary proof transport and credentials were removed, and the final Supabase security-advisor pass contained no WARN or ERROR findings.

## Live sequence evidence

### Phase 1 — deployed version 1

- network health: HTTP 200
- initial ledger sequence: `0`
- live grant: `AG-R12-LIVE`
- ratification: HTTP 201 / `GRANTED`
- grant sequence: `1`
- verification: **ALLOW**
- signed bundle: present
- initial signer: `signer-20260902203811099`
- phase-1 durable ledger sequence after signer preparation/activation: `3`

### Phase 2 — fresh authority version 2

No authority database reset occurred between versions 1 and 2.

- pre-revocation verification: **ALLOW** at durable sequence `3`
- revocation: HTTP 200 / `REVOKED`
- revocation sequence: `4`
- next verification: **DENY / GRANT_NOT_ACTIVE**
- signer rotated from `signer-20260902203811099`
- new active signer: `signer-20260902203908604`
- post-rotation signed bundle included the revocation
- durable ledger sequence after rotation: `6`

### Phase 3 — fresh authority version 3

No authority database reset occurred between versions 2 and 3.

- revoked `AG-R12-LIVE`: **DENY / GRANT_NOT_ACTIVE**
- repeated request ID: **DENY / REPLAY**
- signed bundle still used `signer-20260902203908604`
- concurrent duplicate ratification results: one HTTP `201 GRANTED`, one HTTP `400 MCPAIOS_GRANT_ALREADY_EXISTS`
- concurrency test grant was revoked after the check
- final ledger sequence: `8`

## Final durable state

- ledger sequence: `8`
- ledger head: `8f9390d9e2f8dd8f6141afc43c95e098a5d870af2e298e02084b13471b134baf`
- authority revision: `8`
- event count: `8`
- chain-link errors: `0`
- verification receipt count: `4`
- active proof grants: `0`
- revoked grants: `2`
- revocation records: `2`
- active signer: `signer-20260902203908604`
- retired signers: `1`
- signer secrets retained in protected Vault custody: `2`
- temporary proof API-key rows remaining: `0`
- anon grant SELECT privilege: `false`
- authenticated grant SELECT privilege: `false`

## Deployment defects found and repaired

Run Twelve was not declared PASS on the first deployment attempt.

### pgcrypto schema qualification

Supabase installs `pgcrypto` under `extensions`. Initial API-key bootstrap failed because the reference functions used unqualified `gen_random_bytes()`/`digest()` calls. The functions were repaired to explicitly use `extensions.gen_random_bytes(...)` and `extensions.digest(...)`.

### Replay collision

The deployed verifier initially detected replay but would still attempt a duplicate `request_id` insert. This was repaired so replay returns deterministic `DENY / REPLAY` using the prior receipt without writing a second receipt.

### Mutable helper search paths

Supabase security advisors identified mutable search paths on the two hash helpers. Both were pinned. The final advisor pass contained only INFO notices for intentional RLS-with-no-policy deny-by-default tables and no WARN/ERROR findings.

## Regression preservation

On the final Run Twelve code head, the existing private MCPaios regression workflows remained green:

- Run Eight live authority service — SUCCESS
- Run Ten intent-authority chain — SUCCESS
- Run Eleven identity/delegation — SUCCESS

## Proof cleanup

The temporary one-time network proof transport was removed after PASS:

- one-time proof challenges removed;
- ephemeral proof API-key rows removed;
- proof helper RPCs/table removed;
- temporary `pg_net` transport removed;
- proof-only Edge Functions replaced by JWT-protected closed handlers.

The deployed production authority service does not depend on this proof transport.

## Non-claims

Run Twelve does not claim:

- HSM/KMS custody outside Supabase Vault;
- enterprise identity federation for the network API;
- multi-region consensus/failover;
- multi-tenant authority isolation;
- generalized production SLAs;
- exhaustive packet-loss injection at every response boundary.

Run Twelve proves the narrower critical property that MCPaios now has a **deployed, durable, transactional, revocable, signer-rotatable and reconstructible authority plane that remains authoritative across process replacement and redeployment.**
