# VERIFY

Input: verification request, canonical grant store, replay store, verification time.

1. Validate request shape.
2. Resolve canonical grant using only `grant_id`.
3. If absent, DENY `UNKNOWN_GRANT`.
4. Validate grant status is active.
5. Validate `valid_from <= verification_time < valid_until`.
6. Validate actor exact-match.
7. Validate action is included.
8. Validate target is included.
9. Validate request policy digest exact-matches canonical policy digest.
10. Walk all ancestors and apply status/time checks.
11. Validate child authority is a subset of each immediate parent.
12. Reject previously consumed nonce.
13. If any check fails, DENY with deterministic reason codes.
14. Otherwise atomically consume nonce and ALLOW.
15. Emit decision fingerprints.
