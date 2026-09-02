# MCP2 Run Nineteen — Authority Witness Freshness & Maximum Staleness — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Nineteen proved:

> **Previously Valid Witness ≠ Perpetually Current Witness.**

MCPaios now issues authenticated witness-freshness leases with a hard 300-second maximum lifetime. Witness stores may retain or replay old evidence, but they cannot extend its lifetime or keep expired evidence trusted without breaking authentication.

Private MCPaios Run Nineteen PR #11 merged at:

`00e6a836b756ef290b4f7a051a1a5ea27f8379ac`

## CI evidence

Final tested code head:

`808143fac8bae5eea3ecf4cf5e15ad3138bd33d2`

All ten required workflows passed:

- Run Eight — SUCCESS
- Run Ten — SUCCESS
- Run Eleven — SUCCESS
- Run Thirteen — SUCCESS
- Run Fourteen — SUCCESS
- Run Fifteen — SUCCESS
- Run Sixteen — SUCCESS
- Run Seventeen — SUCCESS
- Run Eighteen — SUCCESS
- Run Nineteen — SUCCESS

The only subsequent private branch change before merge was the deployed Run Nineteen evidence document.

## Freshness mechanism

Each authority-issued freshness envelope binds:

- protocol `mcp2-authority-witness-fresh/1`
- tenant
- canonical authority material
- `issued_at`
- `fresh_until`
- requested lease duration
- hard `max_staleness_seconds = 300`
- HMAC authentication using a secret protected in Supabase Vault

External witness stores do not possess the HMAC root.

## Live proof

Proof tenant: `witness-r19`

Initial authority state:

- sequence `2`
- authority revision `2`
- ledger head `e877fb65affab918fc6113840a3c6f96ca80860db7f5484d7bc960563df8bfc8`
- snapshot digest `4eea2c283a880b6a0b844bf78fe2090c2762abc275d41fabb7a3936a32e755be`
- active grants `1`
- revoked grants `0`
- chain link errors `0`

### Fresh quorum

Three authenticated 120-second envelopes over current authority returned:

**TRUSTED_FRESH_THRESHOLD**

with fresh/authenticated/agreeing count `3` and canonical match `true`.

### Witness self-extension

A witness-side modification extended `fresh_until` while retaining the original signature.

Result:

**SIGNATURE_INVALID**

### Maximum staleness ceiling

A request for a 301-second witness lease returned:

**MCPAIOS_WITNESS_TTL_EXCEEDS_MAX**

The maximum remains 300 seconds.

### Real expiry

A genuine 2-second authority-issued envelope was allowed to cross its expiration boundary.

It remained cryptographically authenticated and policy-valid but inspection returned:

**EXPIRED**

Presenting that expired envelope on all three channels returned:

**WITNESS_FRESHNESS_UNAVAILABLE**

with authenticated count `3`, expired count `3`, fresh count `0`, and trusted `false`.

### Parser hardening

During qualification, an integer-parser edge was identified before deployment: malformed `max_staleness_seconds` input could have surfaced a PostgreSQL cast error.

The canonical implementation was hardened and the full ten-workflow stack rerun successfully.

Live malformed input then returned cleanly:

**MALFORMED**

### Canonical change overrides freshness

Three authenticated 120-second envelopes were issued while grant `AG-R19-BASE` was active. The grant was then revoked immediately while all old envelopes were still unexpired and authentic.

New canonical authority state:

- sequence `3`
- authority revision `3`
- ledger head `4648a04958b7b8181079be9d373d0568c64c5128532af2cff86627bc7d553d48`
- snapshot digest `1a41f663ec28580ccef916c0bef13ba519dd9a850d07f8cf56b7a5d21af0ed0a`
- active grants `0`
- revoked grants `1`
- chain link errors `0`

The still-fresh old witness set returned:

**CANONICAL_FRESHNESS_MISMATCH**

Freshness therefore never overrides canonical revocation.

### Fresh current witness recovery

A new 240-second envelope over the revoked state was independently stored in:

- public MCP2 GitHub witness storage
- Google Drive witness A
- Google Drive witness B

Independent readback preserved the exact authenticated envelope.

Final result:

**TRUSTED_FRESH_THRESHOLD**

with fresh/authenticated/agreeing count `3` and canonical match `true`.

Public GitHub witness commit:

`60ce8d41c4cab85b111f96bd532acc1bc36b29b6`

## Final state

- proof tenant `witness-r19`: retired
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- final chain link errors: `0`
- Run Nineteen witness-envelope tables: `0`
- external witness envelopes persisted in canonical MCPaios tables: `0`
- final Supabase security-advisor scan: no WARN or ERROR findings

## Constitutional rule

Run Nineteen adds:

> **Previously Valid Witness ≠ Perpetually Current Witness.**

## Non-claims

Run Nineteen does not claim trusted hardware time, an external timestamp authority, globally synchronized clocks, threshold signatures, or protection against simultaneous compromise of MCPaios and its Vault freshness root. It proves the narrower property that MCPaios-issued witness evidence has a cryptographically authenticated maximum lifetime and expires fail-closed under bounded server-clock semantics.
