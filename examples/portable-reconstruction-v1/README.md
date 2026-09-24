# Portable Reconstruction Example v1

This directory is a self-contained example of the evidence-availability boundary in MCP2.

It demonstrates that a reviewer can reconstruct one selected authority decision from an exported bundle without access to MCPaios, a database, network services, operational secrets, or implementation-local storage.

The bundle contains:

- the original verification request;
- the complete canonical grant chain for this example;
- the policy material and its digest binding;
- the decision receipt and its algorithm-labeled request/grant fingerprints;
- the verifier time used for the historical decision.

Run:

```text
node examples/portable-reconstruction-v1/verify.mjs
```

A successful run prints `PASS` and the reconstructed decision/fingerprint bindings.

This example deliberately uses a one-grant chain so the evidence boundary is easy to inspect. It does **not** claim that a receipt alone is self-contained, that every operational MCPaios receipt is automatically exportable in this exact shape, or that receipts are independently signed. Operational implementations may store canonical records locally, but external reconstruction requires an export of the records and evidence applicable at the original decision time.

The example is not MCPaios-specific protocol truth. It is a portable MCP2 evidence package.

## Timestamp validation

The example explicitly requires `receipt.verified_at`, `grant.valid_from`, and
`grant.valid_until` to be strings in the timestamp format used by the reference
verifier (date, time with seconds, and `Z` or an explicit numeric offset), with a
finite `Date.parse` result. Missing, null, non-string, malformed, and unparseable
values fail with a field-specific error before time comparisons. No upstream
validation prerequisite is assumed for those three operands.

The grant window includes `valid_from` and excludes `valid_until`. This example
uses JavaScript millisecond precision; it does not establish a general-purpose
calendar validator or prove execution, receipt authenticity, or general receipt
portability. The frozen Candidate and production MCPaios are unchanged by this
example correction.

Run the CLI regression tests (temporary copies leave the published bundle intact):

```text
node --test examples/portable-reconstruction-v1/verify.test.mjs
```
