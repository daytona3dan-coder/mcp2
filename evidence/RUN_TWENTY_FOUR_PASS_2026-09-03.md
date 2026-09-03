# MCP2 Run Twenty-Four — PASS

Date: 2026-09-03

## Constitutional rule

> **Historical Timestamp Membership ≠ Current Timestamp Eligibility.**

## Claim proved

A timestamp authority that becomes compromised can lose current eligibility without erasing the historical provider membership under which earlier provenance was accepted. A replacement provider can be admitted through an epoch transition without permitting stale provider-set replay, provider-epoch rollback, retired-epoch resurrection, or compromised-provider rejoin.

## Provider epochs

Epoch 1 — historical Run Twenty-Three membership:
- GitHub
- Google Drive
- Stripe test mode
- threshold 2-of-3
- config digest `18bbc939c5157935fa9b97999181e5ceff1a7727846e0c2b04ea665a08982c54`

Stripe was then marked compromised for current timestamp membership.

Epoch 2 — temporary bridge:
- GitHub
- Google Drive
- threshold 2-of-2
- config digest `9fbe1f580ece40ea2f662ac16cbbb0bf21a8a7e4dd2488e601ab89a5dbf1a349`

Live epoch-2 outcomes:
- GitHub + Drive → `CURRENT_PROVIDER_THRESHOLD_MET`
- one provider only → `PROVIDER_THRESHOLD_UNAVAILABLE`
- Stripe attempt → `PROVIDER_NOT_CURRENT`
- epoch-1 supplied as current → `PROVIDER_EPOCH_STALE`
- Stripe rejoin → `MCPAIOS_COMPROMISED_PROVIDER_REJOIN_FORBIDDEN`

## Replacement provider qualification

Dropbox was qualified as a fourth vendor before admission.

Public-safe qualification facts:
- proof path `/MCP2-Run-Twenty-Four/dropbox-provider-qualification.json`
- Dropbox server-modified time `2026-09-03T10:38:03Z`
- prior provider epoch 2
- prior config digest `9fbe1f580ece40ea2f662ac16cbbb0bf21a8a7e4dd2488e601ab89a5dbf1a349`
- qualification evidence digest `04b470e54547d6a6708528a0dcce1b531a90036b652a58511dd1122ca3300f0e`

No private Dropbox account identifiers are published here.

Qualification exposed and repaired a defect before admission: the original rotation design did not require external replacement-provider metadata to be durably bound into MCPaios before membership admission. A qualification registry and admission gate were added. Replacement admission now requires matching provider, vendor, prior epoch, prior config digest, external object identity, revision, path, and provider timestamp evidence.

Epoch 3 — restored 2-of-3 set:
- GitHub
- Google Drive
- Dropbox
- threshold 2-of-3
- config digest `0e1a3337736d96eb5d39792fb38512d1b2eecbeb2ee376b09374b8ed3e1ed204`

Live epoch-3 outcomes:
- GitHub + Dropbox → `CURRENT_PROVIDER_THRESHOLD_MET`
- Dropbox alone → `PROVIDER_THRESHOLD_UNAVAILABLE`
- Stripe attempt → `PROVIDER_NOT_CURRENT`
- historical epoch-1 reconstruction → `HISTORICAL_PROVIDER_THRESHOLD_MET`

## State-transition attacks

Direct provider-epoch rollback was rejected with:
`MCPAIOS_PROVIDER_EPOCH_ROLLBACK_FORBIDDEN`

Retired epoch resurrection was rejected with:
`MCPAIOS_PROVIDER_EPOCH_RESURRECTION_FORBIDDEN`

Compromised-provider readmission was rejected with:
`MCPAIOS_COMPROMISED_PROVIDER_REJOIN_FORBIDDEN`

## Final provider transition state

- current epoch: 3
- transition sequence: 3
- ledger head: `0b21afb1f4c6966389dfe33790704bae22b7af6f5b9cee53771fbcee990dfa7d`
- provider-transition link errors: 0
- Stripe current status: compromised
- Dropbox current status: trusted

Fresh Dropbox readback after epoch 3 activation reproduced the same proof object metadata and server timestamp used for qualification.

## CI and merge

All 15 expected MCPaios workflow gates passed on exact implementation head:
`0d5e2539006180f9dfa9bbf98a03b00a2e9b0cc5`

The only commit after that tested implementation head before merge modified:
`docs/RUN-TWENTY-FOUR.md`

Private MCPaios PR #16 merged at:
`79b959b38208e28f75ddc65e2d28b842cc5c7ab1`

## Security closure

The first final Security Advisor pass identified two Run Twenty-Four WARN findings for mutable trigger-function `search_path`. Both functions were hardened to `pg_catalog, public` before closure.

Final Security Advisor result:
- WARN: 0
- ERROR: 0

Remaining notices were INFO-only `rls_enabled_no_policy` findings consistent with the deliberately service-role-only, deny-by-default proof tables.

## Non-claims

Run Twenty-Four does not claim:
- protection against two colluding current timestamp authorities;
- RFC 3161 TSA compliance;
- trusted hardware time;
- that Dropbox is a production timestamp-authority service;
- Byzantine independence of every underlying infrastructure dependency.

Run Twenty-Four is limited to provider-membership rotation, current-eligibility revocation, historical membership preservation, replacement qualification/admission, and rollback/rejoin resistance.
