# REVOKE

Revocation mutates canonical authority state, not historical receipts.

For verification:

- if the referenced grant is revoked, DENY
- if any ancestor is revoked, DENY `ANCESTOR_INVALID`
- descendants need not be physically rewritten if ancestry is checked deterministically at verification time

Implementations may cache ancestry only if revocation invalidates such caches safely.
