# MCP2 Run Twenty-One — External Timestamp Authority & Compromise-Era Provenance — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Twenty-One proved:

> **MAC Validity Under a Compromised Root ≠ Proof of When Evidence Existed.**

A compromised symmetric freshness root can still produce mathematically valid MACs. MCP2/MCPaios therefore uses an external existence-time anchor to distinguish evidence known to exist before the declared compromise boundary from evidence first surfaced afterward.

## Private implementation

MCPaios Run Twenty-One PR #13 merged at:

`23c7f9a55f2336aac0975df06a1b531d5e2f9456`

Final tested repaired code head:

`10de53514e5c228b585fe51a52c7bd79a1a3034f`

All twelve pull-request workflows on that exact head completed successfully, covering Runs Eight, Ten, Eleven, Thirteen through Twenty-One.

## External timestamp provider

This proof used GitHub public issue-comment server timestamps.

Accepted anchors required:

- repository `daytona3dan-coder/mcp2`;
- immutable commit SHA;
- path under `witnesses/run-twenty-one/`;
- exact canonical JSON object digest;
- GitHub `created_at`;
- unchanged comment (`updated_at == created_at`).

Public timestamp thread: MCP2 issue #3, `Run Twenty-One external timestamp anchors`.

The envelope's own `issued_at` was never used to decide compromise-era provenance.

## Pre-compromise evidence anchor

Legitimate epoch-3 envelope:

- commit: `7302d485373a4ff0a11aaa95f063ab1864a647a8`
- path: `witnesses/run-twenty-one/pre-compromise-envelope.json`
- digest: `cc2c53738d3901a87ccea800721958084aa12ee35c33f963464d77ecc7747042`
- GitHub comment: `5518132780`
- `created_at`: `2026-09-02T23:51:07Z`
- `updated_at`: `2026-09-02T23:51:07Z`

## Compromise boundary

Root epoch 3 was declared compromised and root epoch 4 activated.

Externally anchored compromise record:

- commit: `d6e827f529a97d41f96abd431f4b9521df84b8b4`
- path: `witnesses/run-twenty-one/compromise-record.json`
- digest: `a7cd577828c61f89c9d79baa0c7fab016b307c84d73ce10f2896e71e40c1a8fb`
- GitHub comment: `5518142915`
- `created_at`: `2026-09-02T23:52:14Z`
- `updated_at`: `2026-09-02T23:52:14Z`

The legitimate evidence anchor preceded this external compromise boundary by **67 seconds**.

## Post-compromise forgery

After compromise, the proof deliberately produced another valid MAC using the compromised epoch-3 symmetric root.

The forged envelope deliberately backdated its own internal timestamp to:

`issued_at = 2026-09-02T23:50:30Z`

Its actual external anchor was:

- commit: `736fe03854bf75d5e4796c78cff762bdb02e348f`
- path: `witnesses/run-twenty-one/post-compromise-forged-envelope.json`
- digest: `b87bbbb28dea6421dec7290fcc4a3d8ee4da2695cf9ba4833da96d9b051141bf`
- GitHub comment: `5518149661`
- `created_at`: `2026-09-02T23:53:04Z`
- `updated_at`: `2026-09-02T23:53:04Z`

That external timestamp is **50 seconds after** the compromise boundary.

## Decisive classification

MCPaios returned:

- legitimate evidence → `PRE_COMPROMISE_EXTERNALLY_ANCHORED`
- forged/backdated evidence → `POST_COMPROMISE_PROVENANCE_UNTRUSTED`

Both MACs verified under epoch 3 after that root had been marked compromised. The provenance distinction came from the independently anchored GitHub times rather than the envelope's internal time.

## Qualification hardening

Live qualification identified one additional boundary defect: the initial classifier authenticated the externally timestamped compromise declaration but did not also bind its root key IDs and fingerprints to MCPaios's durable Run Twenty root registry.

The implementation was hardened before closure. A digest-consistent compromise declaration whose root metadata conflicts with the durable registry now returns:

`EXTERNAL_TIMESTAMP_INVALID / COMPROMISE_ROOT_REGISTRY_MISMATCH`

Other fail-closed cases:

- edited timestamp anchor → `EXTERNAL_TIMESTAMP_INVALID / ANCHOR_EDITED`
- wrong object digest → `EXTERNAL_TIMESTAMP_INVALID / ANCHOR_OBJECT_DIGEST_MISMATCH`

## Public fresh-compute reconstruction

Public verifier:

`reference/run-twenty-one-fresh-check.mjs`

GitHub Actions workflow:

`MCP2 Run Twenty-One fresh external timestamp check`

- run: `33697398238`
- job: `100469144452`
- Node: `24.19.0`
- conclusion: **SUCCESS**

The fresh runner independently fetched the immutable public witness commits and GitHub comment API and printed:

- `PASS`
- pre classification `PRE_COMPROMISE_EXTERNALLY_ANCHORED`
- forged classification `POST_COMPROMISE_PROVENANCE_UNTRUSTED`
- pre evidence `67` seconds before compromise
- forged evidence `50` seconds after compromise
- forged internal `issued_at` earlier than compromise

## Final state

Proof tenant `witness-r21`:

- retired
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- authority chain errors: `0`

Freshness roots:

- epoch 3: `compromised`
- epoch 4: `active`
- root transition sequence: `4`
- root ledger head: `70d33bd47ae3edba14e14d07964433999613c922c63b292cd17c0def82b221aa`
- root chain errors: `0`

Final Supabase security scan reported no WARN or ERROR findings.

## Constitutional rule

> **MAC Validity Under a Compromised Root ≠ Proof of When Evidence Existed.**

## Non-claims

Run Twenty-One does not claim RFC 3161 TSA compliance, trusted hardware time, GitHub Byzantine independence, or proof of the unknowable instant a secret was first stolen. The externally timestamped compromise declaration establishes the proof boundary. Evidence externally anchored before that boundary can be proven to have existed before the declaration; evidence first anchored afterward cannot claim pre-compromise provenance.
