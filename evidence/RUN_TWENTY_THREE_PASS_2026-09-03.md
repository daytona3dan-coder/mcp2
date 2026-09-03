# MCP2 Run Twenty-Three — Timestamp Quorum Availability & 2-of-3 External Time Authorities — PASS

**Date:** 2026-09-03  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Twenty-Three proved:

> **One Timestamp Authority Failure ≠ Provenance Freeze. One Timestamp Authority Alone ≠ Provenance Truth.**

MCPaios used a strict 2-of-3 timestamp threshold across three separate providers:

- GitHub
- Google Drive
- Stripe test-mode sandbox

One unavailable or corrupted timestamp provider was tolerated. One provider alone remained insufficient.

## Private implementation

MCPaios Run Twenty-Three PR #15 merged at:

`c63df429f3e8ef82517fbd8720191a53f0a27e5d`

Final tested code head:

`01cf0be5924e2ecbe16b2767ade4c26a4a6cd465`

All fourteen expected pull-request workflows passed on that exact code head.

The only PR-head commit after the tested code head was:

`54d935edfeb611dcfc196bab017070016f69aecf`

It modified only `docs/RUN-TWENTY-THREE.md` to record deployed PASS evidence.

## Stripe timestamp carrier

Stripe was used only in a test-mode sandbox as a proof timestamp carrier, not for commerce and not as a claimed production timestamp-authority service.

Canonical proof Products were inactive, had no default Price, and had no Checkout/payment path. Metadata bound the Run, tenant, kind, and exact canonical object digest. Stripe's server-assigned Product `created` value supplied provider time.

Canonical Stripe proof objects:

- PRE evidence: `prod_VBmuanaAQiE96O`
- compromise record: `prod_VBmwmn9GdCOVHV`
- POST forged evidence: `prod_VBmyfaMTqgZ5Rm`

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
- private Drive file identifiers are intentionally omitted

Stripe test mode:

- Product `prod_VBmuanaAQiE96O`
- provider time `2026-09-03T01:20:23Z`
- inactive
- no default Price
- metadata digest matched the PRE envelope

## Compromise boundary

MCPaios marked freshness root epoch 5 `compromised` and atomically activated epoch 6.

Compromise-record digest:

`3fa35fdf9037b63256597e6f41f6c00c96ce5073642b43791a0329b8d46e8a69`

GitHub:

- commit `dd5da6ce49e7b222832910ba7c38e45f1caec4e9`
- path `witnesses/run-twenty-three/compromise-record.json`
- comment `5518872958`
- provider time `2026-09-03T01:22:26Z`
- comment remained unedited

Google Drive:

- revision `2`
- provider revision time `2026-09-03T01:22:45.921Z`
- private Drive file identifiers are intentionally omitted

Stripe test mode:

- Product `prod_VBmwmn9GdCOVHV`
- provider time `2026-09-03T01:22:55Z`
- inactive
- no default Price
- metadata digest matched the compromise record

The compromise record matched MCPaios's durable root registry.

## PRE threshold matrix

Results:

- 3-of-3 PRE → `PRE_COMPROMISE_EXTERNALLY_THRESHOLD_ANCHORED`
- GitHub unavailable; Drive + Stripe → trusted PRE
- Drive unavailable; GitHub + Stripe → trusted PRE
- Stripe unavailable; GitHub + Drive → trusted PRE
- one provider only → `TIMESTAMP_THRESHOLD_UNAVAILABLE`
- GitHub corrupted alone → honest Drive + Stripe still established trusted PRE
- Drive corrupted alone → honest GitHub + Stripe still established trusted PRE
- Stripe corrupted alone → honest GitHub + Drive still established trusted PRE

This established the availability theorem while preserving one-provider insufficiency.

## Post-compromise forgery

After root epoch 5 was compromised, the proof deliberately produced another mathematically valid epoch-5 MAC with a false internal creation time:

`issued_at = 2026-09-03T01:20:00Z`

Forged-envelope digest:

`c4403a8cb7d7d4a69c8efc7c92a0b5883f1aef5787bfab9feb9cb1d807ab5253`

GitHub:

- commit `6454f84e6f9c5e44fdfc5170a1a1ab1b4145b3e5`
- path `witnesses/run-twenty-three/post-compromise-forged-envelope.json`
- comment `5518888847`
- provider time `2026-09-03T01:24:30Z`
- comment remained unedited

Google Drive:

- revision `2`
- provider revision time `2026-09-03T01:24:52.515Z`
- fresh revision readback recovered the exact forged envelope
- private Drive file identifiers are intentionally omitted

Stripe test mode:

- Product `prod_VBmyfaMTqgZ5Rm`
- provider time `2026-09-03T01:25:02Z`
- inactive
- no default Price
- metadata digest matched the forged envelope

All three external providers independently placed the forged object after the compromise boundary despite its backdated internal `issued_at`.

Fresh classifier rerun result:

`POST_COMPROMISE_PROVENANCE_UNTRUSTED`

Fresh classifier details:

- GitHub relation: POST
- Google Drive relation: POST
- Stripe relation: POST
- valid providers: 3
- POST count: 3
- required threshold: 2
- trusted provenance: false

Historical inspection independently confirmed:

- epoch-5 signature remained mathematically valid;
- epoch 5 status was `compromised`;
- current epoch was 6;
- current eligibility was false;
- internal `issued_at` did not determine external provenance.

## Disagreement and availability cases

Qualification distinguished provider invalidity from valid-provider disagreement.

- one-provider-only → `TIMESTAMP_THRESHOLD_UNAVAILABLE`
- two individually valid providers with opposite PRE/POST relations and the third unavailable → `TIMESTAMP_THRESHOLD_MISMATCH`
- corrupted Stripe timestamp with honest GitHub + Drive → `POST_COMPROMISE_PROVENANCE_UNTRUSTED`

## Fresh provider readback

Fresh post-closure reads reconfirmed:

- GitHub PRE, compromise, and POST anchor comments retained matching `created_at` and `updated_at` values and remained unedited;
- Drive revision-2 provider times remained `2026-09-03T01:19:07.637Z`, `2026-09-03T01:22:45.921Z`, and `2026-09-03T01:24:52.515Z` for PRE, compromise, and POST respectively;
- the three canonical Stripe proof Products remained test-mode, inactive, no-price, and metadata-bound to the accepted digests.

## Final authority state

Proof tenant `witness-r23`:

- status: `retired`
- active proof grants: `0`
- revoked proof grants: `1`
- active proof API credentials: `0`
- authority sequence: `3`
- authority revision: `3`
- authority ledger head: `53b997011a211d7addb35076d90d90318fc95f7869216a084217f8287c1fce1e`
- authority snapshot digest: `1e84e3ce160643773cbdf10620e9549c6b60ca3d923b27150539d1feba2ff8bc`
- authority chain-link errors: `0`

Freshness-root state:

- epoch 5: `compromised`
- epoch 6: `active`
- root transition sequence: `6`
- root ledger head: `8c370ce746cdb99bd32b04c7209a75ec3a8eb948ec12749829122f94757eb558`
- root chain-link errors: `0`

## Security closure

A fresh Supabase Security Advisor scan at `2026-09-03T01:52:50Z` reported:

- WARN: `0`
- ERROR: `0`

Remaining findings were INFO-only `rls_enabled_no_policy` notices on deliberate service-role-only, deny-by-default proof tables.

Run Twenty-Three classifier functions have no `PUBLIC`, `anon`, or `authenticated` EXECUTE grants; only `postgres` and `service_role` retain EXECUTE.

## Public anchor thread

MCP2 issue #6 is the authoritative Run Twenty-Three GitHub timestamp thread.

Issues #7 and #8 were previously closed as superseded/discarded. A later accidental issue #9 created during evidence filename correction was immediately closed as discarded/not planned and is not part of the proof record.

## Constitutional rule

> **One Timestamp Authority Failure ≠ Provenance Freeze. One Timestamp Authority Alone ≠ Provenance Truth.**

## Intended theorem

> **Loss or corruption of one timestamp authority does not freeze provenance, while one timestamp authority alone cannot establish provenance.**

## Non-claims

Run Twenty-Three does not claim:

- RFC 3161 TSA compliance;
- protection against two colluding timestamp providers;
- trusted hardware time;
- Byzantine independence of every underlying infrastructure dependency;
- Stripe is a production timestamp-authority service.

The proof is limited to the 2-of-3 availability and single-provider-fault theorem across the three selected external provider surfaces.