# MCP2 Run Sixteen — Independent Authority Witness & Tamper-Evident History — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios  
**Independent witness store:** public MCP2 GitHub repository

## Result

Run Sixteen proved:

> **Canonical History ≠ Independently Proven History.**

A privileged rollback restored the canonical MCPaios database to an earlier internally valid authority state. The internal hash chain still reported zero link errors, the ledger head matched its terminal event, the snapshot digest matched the earlier active-authority state, and canonical verification returned **ALLOW**.

A later revocation had already been independently witnessed outside the canonical database. Comparison against that later witness therefore returned **WITNESS_MISMATCH**, preventing the rolled-back state from being trusted as current authority.

Private MCPaios Run Sixteen PR #8 merged at:

`bdb5557f9f650a933cd0e505cef91c96af40496d`

## CI evidence

Final tested code head:

`620a04b90f6a85b1fe6f6674efbd74c7d7f5be65`

All seven required checks completed successfully:

- Run Eight — SUCCESS
- Run Ten — SUCCESS
- Run Eleven — SUCCESS
- Run Thirteen — SUCCESS
- Run Fourteen — SUCCESS
- Run Fifteen — SUCCESS
- Run Sixteen — SUCCESS

The only subsequent branch change before merge was the deployed Run Sixteen evidence document.

## Independent witness chain

Witnesses were committed outside Supabase under:

`witnesses/run-sixteen/`

### Witness 1 — active authority

File: `witnesses/run-sixteen/001-active.json`  
Commit: `60f11130b754b7e709c6327612c8a535fda5e25f`

Material:

- tenant: `witness-r16`
- sequence: `2`
- authority revision: `2`
- ledger head: `0f89f5ded4a0f16b9a7b9f46d73db7e7c379c56c7954bf27fa72e04a0ab3b8e3`
- snapshot digest: `41c737d47f5c33d87cce140e8f299cb4924235078697b4794d581eafeaf8ac77`
- active grants: `1`
- revoked grants: `0`
- chain link errors: `0`

### Witness 2 — later revocation

File: `witnesses/run-sixteen/002-revoked.json`  
Commit: `2def55401d78b4789434fc2a9ed35ccb473ef713`

Witness 2 links to Witness 1's commit.

Material:

- sequence: `3`
- authority revision: `3`
- ledger head: `72ed50eab4efbf523504138c676709ea72747af9a20ab92c94e4b12c962a3f68`
- snapshot digest: `67f987a4819b33a0323568defbec3299c89d46b26e81734517fab7b82eeb8d97`
- active grants: `0`
- revoked grants: `1`
- chain link errors: `0`

## Privileged rollback attack

A proof-only helper removed only the terminal `AUTHORITY_REVOKED` transition from the `witness-r16` proof tenant.

After rollback, canonical material exactly matched Witness 1 again:

- sequence `2`
- authority revision `2`
- ledger head `0f89f5de...`
- snapshot digest `41c737d4...`
- active grant count `1`
- chain link errors `0`
- ledger head matched terminal event

Canonical MCPaios verification against the rolled-back state returned **ALLOW**.

This proves an internally valid chain can still represent obsolete authority history after privileged rollback.

## Independent mismatch detection

The current rolled-back database was compared against independently stored Witness 2.

Result:

**WITNESS_MISMATCH**

Observed mismatch:

- sequence `2` vs witnessed `3`
- authority revision `2` vs witnessed `3`
- ledger head `0f89...` vs witnessed `72ed...`
- snapshot digest `41c7...` vs witnessed `67f9...`

The comparison is fail-closed and does not persist external witness material inside the canonical authority database.

## Legitimate repair

The grant was legitimately revoked again after rollback detection.

New canonical state:

- sequence: `3`
- authority revision: `3`
- ledger head: `fed96ffbfc3b33411e21e4892a4ca144eadf90ceb654f70d03524f1792f859ca`
- snapshot digest: `39d8361eac3d7d93ecc6c2af45013520e9e42b4411a2d85b6adaced6fd96a8b5`
- active grants: `0`
- revoked grants: `1`
- chain link errors: `0`

### Witness 3 — repaired revocation

File: `witnesses/run-sixteen/003-repaired-revocation.json`  
Commit: `3c3d26e17994139db3ffbb9bc9a3c3baa5fb71a4`

Witness 3 links to Witness 2 and records the legitimate repaired state. Canonical comparison against Witness 3 returned **TRUSTED**.

## Fresh-compute validation

A newly deployed Edge Function fetched Witness 3 directly from the public MCP2 GitHub repository at runtime, then compared the external witness material against current canonical Supabase state.

Fresh compute returned:

- source: `public-github-witness`
- witness index: `3`
- witness commit: `3c3d26e17994139db3ffbb9bc9a3c3baa5fb71a4`
- decision: **TRUSTED**
- exact sequence/revision/ledger-head/snapshot-digest match

The proof function was then redeployed as a JWT-protected `410` closed endpoint.

## Cleanup and final state

After acceptance:

- proof tenant `witness-r16`: retired
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- final chain link errors: `0`
- final ledger head matched terminal event
- privileged rollback helper: removed
- temporary `pg_net`: removed
- fresh-compute proof endpoint: closed and JWT-protected
- final Supabase security-advisor scan: no WARN or ERROR findings

Witness records contain no API credentials, private signing material, or Vault secrets.

## Constitutional rule

Run Sixteen adds:

> **Canonical History ≠ Independently Proven History.**

The proven stack now includes:

- Specification ≠ Authority
- Identity ≠ Authority
- Capability ≠ Authority
- Authority ≠ Process State
- Tenant A Authority ≠ Tenant B Authority
- Backup ≠ Recoverable Authority unless anchored and authenticated
- Stale Distributed Authority ≠ Executable Authority
- Canonical History ≠ Independently Proven History

## Non-claims

Run Sixteen does not claim GitHub is a universal transparency log, Byzantine consensus, immutable blockchain storage, or protection against simultaneous compromise of both MCPaios and the independent witness provider. It proves the narrower property that privileged rollback of canonical authority history becomes detectable and fail-closed while an independently stored later witness remains available.
