# MCP2 Run Twenty — Freshness Root Rotation & Compromise Recovery — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Twenty proved:

> **Root Compromise Must End Current Trust Without Erasing History.**

MCPaios now operates witness freshness under monotonic root epochs. Only the current active root epoch may satisfy current authority freshness. Retired and compromised roots remain cryptographically inspectable for reconstruction but can never regain current-trust authority.

Private MCPaios Run Twenty PR #12 merged at:

`838d9aec660f094b8ce886a5570f7f104fe18780`

## CI evidence

Final tested code head:

`30cb866762777907dceae52d3b8155e4b32a0c5a`

All eleven required workflows passed:

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
- Run Twenty — SUCCESS

## Root epochs

Final deployed root history:

- epoch 1 — `retired`
- epoch 2 — `compromised`
- epoch 3 — `active`

Final root-transition ledger:

- sequence: `3`
- event count: `3`
- ledger head: `3fdedd29473c106298e20d7d931f137cf4ab160456734f202d01a3555e4cbcf1`
- link errors: `0`

No secret root material or Vault secret identifiers are published in this evidence record.

## Epoch 1 baseline

Epoch 1 issued three 240-second freshness leases over current authority.

Result:

**TRUSTED_ROOT_FRESH_THRESHOLD**

All three leases were valid, current, fresh, mutually agreeing, and matched canonical authority.

## Scheduled rotation to epoch 2

Scheduled rotation atomically retired epoch 1 and activated epoch 2.

The epoch-1 leases remained inside their original freshness window and their MACs remained valid.

Historical inspection returned:

**HISTORICALLY_AUTHENTIC**

Current classification returned:

**ROOT_EPOCH_RETIRED**

The old epoch-1 threshold returned:

**ROOT_FRESHNESS_UNAVAILABLE**

Scheduled rotation therefore removed current trust immediately without erasing historical verification.

## Epoch 2 baseline

Fresh epoch-2 leases returned:

**TRUSTED_ROOT_FRESH_THRESHOLD**

## Simulated root compromise and recovery

While epoch-2 leases were still unexpired, MCPaios marked epoch 2 compromised and atomically activated epoch 3.

The old epoch-2 MACs still verified mathematically.

Historical classification returned:

**SIGNATURE_VALID_COMPROMISED_EPOCH**

Current classification returned:

**ROOT_EPOCH_COMPROMISED**

The old epoch-2 threshold returned:

**ROOT_FRESHNESS_UNAVAILABLE**

MCPaios intentionally does not call a MAC from a compromised symmetric root historically trustworthy merely because it verifies. Once the root is considered compromised, external evidence is needed to establish when a MAC was produced.

## Rollback and resurrection resistance

Direct privileged-state attempts produced:

- lower current root epoch → **MCPAIOS_ROOT_EPOCH_ROLLBACK_FORBIDDEN**
- reactivate retired epoch 1 → **MCPAIOS_ROOT_RESURRECTION_FORBIDDEN**
- reactivate compromised epoch 2 → **MCPAIOS_ROOT_RESURRECTION_FORBIDDEN**

These are database-enforced invariants.

## Epoch 3 recovery

Fresh epoch-3 leases returned:

**TRUSTED_ROOT_FRESH_THRESHOLD**

with eligible count `3`, agreeing count `3`, and canonical match `true`.

A separate fresh execution-context read recovered the same current epoch `3`, root statuses, event count, ledger head, and zero-link-error root chain from durable database/Vault records.

## Final proof cleanup

Proof tenant `witness-r20` finished:

- tenant status: `retired`
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- authority-chain link errors: `0`

Final Supabase security-advisor scan reported no WARN or ERROR findings. Remaining INFO-only RLS/no-policy notices reflect the service-role-only deny-by-default table design.

## Constitutional rule

Run Twenty adds:

> **Root Compromise Must End Current Trust Without Erasing History.**

A normally retired root can continue to support historical MAC verification. A compromised root can support only cryptographic inspection, not a claim of post-compromise provenance or current authority.

## Non-claims

Run Twenty does not claim HSM-backed roots, threshold MACs, external timestamp authority, or post-compromise provenance from a compromised symmetric root. It proves monotonic root rotation, current-trust invalidation, compromise recovery, rollback resistance, root non-resurrection, and durable cryptographic inspectability of historical witness material.
