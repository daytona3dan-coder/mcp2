# MCP2 Run Eighteen — Threshold Witness Quorum & Witness Availability — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Eighteen proved:

> **One Witness Failure ≠ Authority Freeze. One Witness Alone ≠ Authority Truth.**

MCPaios evaluated three configured witness channels under a strict 2-of-3 threshold. Two matching current witnesses were sufficient to establish trusted current authority history. One witness alone was insufficient. Stale or colluding witness majorities could not override current canonical authority.

Private MCPaios Run Eighteen PR #10 merged at:

`4f4b7a082b6dfae54a8f297736337b2b1081d5f1`

## CI evidence

Final tested code head:

`058044ae8e14e10d4f5ddbc0fb056c0bf9b8dc0a`

All nine workflows passed:

- Run Eight — SUCCESS
- Run Ten — SUCCESS
- Run Eleven — SUCCESS
- Run Thirteen — SUCCESS
- Run Fourteen — SUCCESS
- Run Fifteen — SUCCESS
- Run Sixteen — SUCCESS
- Run Seventeen — SUCCESS
- Run Eighteen — SUCCESS

## Witness-channel scope

Run Eighteen used three witness channels:

1. public GitHub witness
2. Google Drive witness A
3. Google Drive witness B

The two Google Drive channels share an underlying vendor. Run Eighteen therefore proves threshold-channel availability and fault tolerance, not three-vendor Byzantine independence. Run Seventeen remains the cross-vendor witness-compromise proof.

## Base authority

Proof tenant: `witness-r18`

Base authority material:

- sequence: `2`
- authority revision: `2`
- ledger head: `538c31cef4cda5397f51eb38272ed5a9f2d7b4fa2e5b9545f7f7b5428a4acf7a`
- snapshot digest: `1735c47fa54ba909f6bb7b6dde6e136360f3120478f244c58b57359e2b6cef33`
- active grants: `1`
- revoked grants: `0`
- chain link errors: `0`

All three channels initially held the same material.

Baseline result: **TRUSTED_THRESHOLD** with agreeing count `3`.

## Threshold fault matrix

### Each channel unavailable in turn

- GitHub unavailable → **TRUSTED_THRESHOLD** using Drive A + Drive B
- Drive A unavailable → **TRUSTED_THRESHOLD** using GitHub + Drive B
- Drive B unavailable → **TRUSTED_THRESHOLD** using GitHub + Drive A

Each result had valid count `2`, agreeing count `2`, and canonical match `true`.

### One channel only

Only one valid witness remained available.

Result: **WITNESS_THRESHOLD_UNAVAILABLE**.

### One forged witness

One well-formed false witness was supplied while the other two witnesses remained current.

Result: **TRUSTED_THRESHOLD** using the two current witnesses.

### Three-way disagreement

All three supplied valid witness materials differed.

Result: **WITNESS_THRESHOLD_MISMATCH**.

### Two colluding false witnesses

Two channels agreed on the same false fingerprint.

Result: **CANONICAL_THRESHOLD_MISMATCH**.

Two agreeing witness channels therefore cannot overwrite current canonical authority merely by forming a threshold majority.

## Stale-majority proof

Canonical authority legitimately advanced by revoking `AG-R18-BASE` while all three external channels still held the older active state.

Current canonical material became:

- sequence: `3`
- authority revision: `3`
- ledger head: `c9fa68e2eebfe8360272c5ca3cf72562cf2801eb5c738dbd3089b1163208dc52`
- snapshot digest: `59c9787ac14886199cdee721596036f7692df774e6f290433f5dac417e0d0d8a`
- active grants: `0`
- revoked grants: `1`
- chain link errors: `0`

All three stale channels still agreed with one another.

Result: **CANONICAL_THRESHOLD_MISMATCH**.

## Availability recovery

Only GitHub and Drive A were updated to the current revoked state. Drive B remained stale.

Result: **TRUSTED_THRESHOLD** with agreeing channels `github` + `drive-a`, agreeing count `2`, and canonical match `true`.

This is the decisive Run Eighteen availability proof: current authority-history trust recovered without waiting for the third witness channel.

Drive B was then updated to the current revoked state.

Final result: **TRUSTED_THRESHOLD** with agreeing count `3`.

## Final state

- proof tenant `witness-r18`: retired
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- final chain link errors: `0`
- GitHub witness: current revoked state
- Drive A witness: current revoked state
- Drive B witness: current revoked state
- external witness material persisted in canonical MCPaios: `0`
- final Supabase security-advisor scan: no WARN or ERROR findings

GitHub base witness commit:

`87d2dc8acce1f1429a848148e465cd19d4f318da`

GitHub current revoked witness commit:

`a89ce02def2cabba5c0063d5521d8c765d7ee33c`

## Constitutional rule

Run Eighteen adds:

> **One Witness Failure ≠ Authority Freeze. One Witness Alone ≠ Authority Truth.**

## Non-claims

Run Eighteen does not claim three independent cloud vendors, Byzantine fault tolerance, threshold signatures, or production provider-routing SLAs. It proves the narrower 2-of-3 threshold property that one witness channel may disappear or lie without freezing or rewriting current authority history, provided two configured channels agree with current canonical authority.
