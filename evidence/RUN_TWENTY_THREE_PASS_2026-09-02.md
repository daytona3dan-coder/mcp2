# MCP2 Run Twenty-Three — Timestamp Quorum Availability & 2-of-3 External Time Authorities — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Twenty-Three proved:

> **One Timestamp Authority Failure ≠ Provenance Freeze. One Timestamp Authority Alone ≠ Provenance Truth.**

MCPaios used a strict 2-of-3 timestamp threshold across three separate providers:

- GitHub
- Google Drive
- Stripe test-mode sandbox

One unavailable or corrupted provider was tolerated. One provider alone remained insufficient.

## Private implementation

MCPaios Run Twenty-Three PR #15 merged at:

`c63df429f3e8ef82517fbd8720191a53f0a27e5d`

Final tested code head:

`01cf0be5924e2ecbe16b2767ade4c26a4a6cd465`

All fourteen expected pull-request workflows passed on that exact code head, covering Runs Eight, Ten, Eleven, Thirteen through Twenty-Three.

## Stripe timestamp carrier

Stripe was used only in a test-mode sandbox as the third provider.

Proof Products were:

- inactive;
- without a default Price;
- without Checkout Sessions or payment paths;
- metadata-bound to the Run, tenant, object kind, and exact canonical digest.

Stripe's server-assigned Product `created` field supplied the timestamp.

## Legitimate PRE evidence

Proof tenant: `witness-r23`

Envelope digest:

`1ad7b455c837aa67a51a3300ae44ebd693f0ae278ef1dd77cac847cd1f971e17`

GitHub:

- commit `cdce3c8d5ff07b2bc1d6025477cd73608748e4fb`
- path `witnesses/run-twenty-three/pre-compromise-envelope.json`
- comment `5518853140`
- provider time `2026-09-03T01:19:52Z`
- comment remained unedited

Google Drive:

- revision `2`
- provider revision time `2026-09-03T01:19:07.637Z`
- fresh revision readback recovered the exact envelope content

Stripe test mode:

- provider time `2026-09-03T01:20:23Z`
- inactive Product
- no default Price
- metadata digest matched the envelope

## Compromise boundary

MCPaios marked root epoch 5 compromised and atomically activated epoch 6.

Compromise-record digest:

`3fa35fdf9037b63256597e6f41f6c00c96ce5073642b43791a0329b8d46e8a69`

GitHub:

- commit `dd5da6ce49e7b222832910ba7c38e45f1caec4e9`
- path `witnesses/run-twenty-three/compromise-record.json`
- comment `5518872958`
- provider time `2026-09-03T01:22:26Z`

Google Drive:

- revision `2`
- provider revision time `2026-09-03T01:22:45.921Z`

Stripe test mode:

- provider time `2026-09-03T01:22:55Z`
- inactive/no-price Product
- metadata digest matched the compromise record

The compromise record matched the durable root registry.

## PRE threshold matrix

Results:

- all three providers available → `PRE_COMPROMISE_EXTERNALLY_THRESHOLD_ANCHORED`
- GitHub unavailable; Drive + Stripe → trusted PRE
- Drive unavailable; GitHub + Stripe → trusted PRE
- Stripe unavailable; GitHub + Drive → trusted PRE
- one provider only → `TIMESTAMP_THRESHOLD_UNAVAILABLE`
- GitHub timestamp corrupted alone → honest Drive + Stripe still established trusted PRE
- Drive timestamp corrupted alone → honest GitHub + Stripe still established trusted PRE
- Stripe timestamp corrupted alone → honest GitHub + Drive still established trusted PRE

## Post-compromise forgery

After epoch 5 was compromised, the proof deliberately generated another mathematically valid epoch-5 MAC while backdating its internal timestamp to:

`issued_at = 2026-09-03T01:20:00Z`

Forged-envelope digest:

`c4403a8cb7d7d4a69c8efc7c92a0b5883f1aef5787bfab9feb9cb1d807ab5253`

GitHub:

- commit `6454f84e6f9c5e44fdfc5170a1a1ab1b4145b3e5`
- path `witnesses/run-twenty-three/post-compromise-forged-envelope.json`
- comment `5518888847`
- provider time `2026-09-03T01:24:30Z`

Google Drive:

- revision `2`
- provider revision time `2026-09-03T01:24:52.515Z`

Stripe test mode:

- provider time `2026-09-03T01:25:02Z`
- inactive/no-price Product
- metadata digest matched the forged object

All three independently placed the object after compromise despite the backdated internal time.

Result:

`POST_COMPROMISE_PROVENANCE_UNTRUSTED`

A corrupted Stripe timestamp with honest GitHub + Drive still returned the same POST result.

## Disagreement vs invalidity

An intentionally malformed GitHub timestamp mutation first caused that provider to be rejected as invalid, correctly reducing the system to one valid provider and producing `TIMESTAMP_THRESHOLD_UNAVAILABLE`.

The corrected disagreement harness kept GitHub and Drive individually valid but gave them opposite PRE/POST relations while Stripe was unavailable.

Result:

`TIMESTAMP_THRESHOLD_MISMATCH`

## Final state

Proof tenant `witness-r23`:

- retired
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- authority sequence: `3`
- authority revision: `3`
- authority ledger head: `53b997011a211d7addb35076d90d90318fc95f7869216a084217f8287c1fce1e`
- authority snapshot digest: `1e84e3ce160643773cbdf10620e9549c6b60ca3d923b27150539d1feba2ff8bc`
- authority chain errors: `0`

Freshness roots:

- epoch 5: `compromised`
- epoch 6: `active`
- root transition sequence: `6`
- root ledger head: `8c370ce746cdb99bd32b04c7209a75ec3a8eb948ec12749829122f94757eb558`
- root chain errors: `0`

Final Supabase security scan reported no WARN or ERROR findings.

## Public anchor thread

MCP2 issue #6 is the authoritative Run Twenty-Three GitHub timestamp thread.

Two accidental issues created during execution were explicitly closed as superseded/discarded and are not part of the accepted proof record.

## Constitutional rule

> **One Timestamp Authority Failure ≠ Provenance Freeze. One Timestamp Authority Alone ≠ Provenance Truth.**

## Non-claims

Run Twenty-Three does not claim RFC 3161 TSA compliance, Byzantine safety against two colluding timestamp providers, or global trusted hardware time. It proves the narrower 2-of-3 availability and single-provider-fault theorem across three separate vendors.