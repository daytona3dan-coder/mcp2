# MCP2 Run Twenty-Two — External Timestamp Quorum & Timestamp-Provider Compromise — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**Operational implementation:** MCPaios

## Result

Run Twenty-Two proved:

> **One External Timestamp Provider ≠ Proven Compromise-Era Provenance.**

MCPaios required strict 2-of-2 agreement between GitHub and Google Drive for compromise-era timestamp provenance. Both providers had to bind the same evidence object, the same compromise record, and agree on PRE/POST ordering relative to the durable root-compromise boundary.

Private MCPaios Run Twenty-Two PR #14 merged at:

`0eba06f559c17f553984cdb6e3a67e4850f97f53`

## CI evidence

Final tested code head:

`f3995e460015f91e305904fbe29e2d61426d9b34`

All thirteen expected pull-request workflows passed on that exact head, covering Runs Eight, Ten, Eleven, Thirteen through Twenty-Two.

## Providers

- GitHub public MCP2 repository + GitHub server issue-comment timestamps
- Google Drive native document revisions + provider revision timestamps

## Legitimate pre-compromise evidence

Proof tenant: `witness-r22`

Envelope digest:

`e94fe442c38e1706f543a2f7248483d854391be6b1bfe86f54234cca2655facf`

GitHub:

- immutable commit `35f75df8d780cdec0692c4877b9a8b96430fccd6`
- path `witnesses/run-twenty-two/pre-compromise-envelope.json`
- comment `5518612052`
- provider time `2026-09-03T00:49:27Z`
- comment remained unedited

Google Drive:

- revision `2`
- provider revision time `2026-09-03T00:48:39.765Z`
- fresh readback recovered the exact envelope content

## Compromise boundary

MCPaios marked freshness root epoch 4 compromised and atomically activated epoch 5.

Compromise-record digest:

`fe5763141bb9f116cddf58b97443cc47780f9e5f764e6a347272e34a1095812d`

GitHub:

- immutable commit `84dee5f9a97de4ac215d91c7f60cdfae572388b2`
- path `witnesses/run-twenty-two/compromise-record.json`
- comment `5518626467`
- provider time `2026-09-03T00:51:16Z`

Google Drive:

- compromise revision `2`
- provider revision time `2026-09-03T00:51:06.873Z`

The compromise record matched the durable Run Twenty root registry.

## PRE quorum classification

Provider ordering:

- GitHub: PRE
- Google Drive: PRE

Result:

**PRE_COMPROMISE_EXTERNALLY_QUORUM_ANCHORED**

`trusted_provenance = true`

## Post-compromise forgery

After root epoch 4 was compromised, the proof deliberately used the compromised epoch-4 symmetric key to produce another mathematically valid MAC.

The forged envelope backdated its own internal timestamp to:

`issued_at = 2026-09-03T00:49:00Z`

Forged-envelope digest:

`a9a4edfaeeabcd2e903e34c60db3bccb8574496f12d16a4d87bef001c58bafea`

GitHub:

- immutable commit `6c5a170aff61be54340fb5d72edf1f7fa38d9d35`
- path `witnesses/run-twenty-two/post-compromise-forged-envelope.json`
- comment `5518639174`
- provider time `2026-09-03T00:52:54Z`

Google Drive:

- revision `2`
- provider revision time `2026-09-03T00:52:45.130Z`

Both providers independently placed the forged object after compromise despite the backdated internal timestamp.

Result:

**POST_COMPROMISE_PROVENANCE_UNTRUSTED**

`trusted_provenance = false`

## Single-provider compromise tests

One provider at a time was allowed to lie about its own timestamp while still presenting the correct object digest.

Results:

- GitHub-only timestamp corruption → `TIMESTAMP_PROVIDER_QUORUM_MISMATCH`
- Google Drive-only timestamp corruption → `TIMESTAMP_PROVIDER_QUORUM_MISMATCH`
- Google Drive unavailable → `TIMESTAMP_QUORUM_UNAVAILABLE`

No single timestamp provider could rewrite accepted compromise-era provenance.

## Final state

Proof tenant `witness-r22`:

- tenant status `retired`
- active proof grants `0`
- revoked proof grants `1`
- active proof API credentials `0`
- authority sequence `3`
- authority revision `3`
- authority ledger head `da7aabee9fcffed665b578940c6f6207bf9a5a60c76baee404d2b8af83ee70a7`
- authority snapshot digest `09e426f8c02088dda6bcb2801d223b6fb0c89dfd1ca3935b48991a9d78090c44`
- authority chain errors `0`

Freshness roots:

- epoch 4 `compromised`
- epoch 5 `active`
- root transition sequence `5`
- root ledger head `7390879aa8c95c513ef669b8436b2d253d9dddf56355b00da5514725ee2e9ec0`
- root chain errors `0`

Final Supabase security scan reported no WARN or ERROR findings.

## Constitutional rule

> **One External Timestamp Provider ≠ Proven Compromise-Era Provenance.**

## Non-claims

Run Twenty-Two does not claim RFC 3161 TSA compliance, high availability under provider outage, or Byzantine independence of every infrastructure dependency behind GitHub or Google Drive. It proves the narrower 2-of-2 theorem that compromise of one timestamp provider is insufficient to rewrite accepted compromise-era provenance when the independent second provider disagrees.
