# MCP2 Portable Reconstruction Example

This example answers a practical evidence-availability question:

> What must an external reviewer obtain to reconstruct an MCP2 decision without access to MCPaios or implementation-local operational storage?

For this example, the portable bundle contains:

- the original verification request;
- the canonical grant record used for the decision;
- the policy material plus its digest binding;
- the decision receipt;
- the verification time and protocol version.

The receipt is intentionally **not** treated as a self-contained authority record. Reconstruction uses the receipt together with the canonical records and evidence applicable at the original decision time.

## Run

From the repository root:

```text
node examples/portable-reconstruction/verify.mjs
```

Expected result:

- the policy digest recomputes and matches the request/grant binding;
- the clean-room verifier independently reconstructs `ALLOW`;
- the receipt hash validates;
- the receipt's request and grant fingerprints match the reconstructed authority decision;
- `reconstructible` is `true`.

The verification code imports only the public MCP2 clean-room verifier in this repository. That verifier does not import, call, connect to, or trust MCPaios and performs no network access while reconstructing the decision.

## What this proves

This is a concrete public example of **portable evidence availability** for one bounded MCP2 decision. An external reviewer can reconstruct the decision from explicit exported material rather than from implementation-local storage.

It demonstrates the separation between:

1. the **receipt**, which identifies and integrity-binds the decision; and
2. the **canonical records/evidence**, which supply the authority state needed to reconstruct why that decision was valid.

## What this does not prove

This example does not claim:

- that every operational MCPaios receipt is currently packaged this way;
- that a receipt by itself contains every canonical record;
- that arbitrary live receipts are independently signed;
- that operational secrets or private databases are unnecessary for every implementation;
- external interoperability certification.

An operational implementation may retain canonical authority data locally, but to support external reconstruction it must be able to export the records/evidence needed by the applicable MCP2 profile.

## Relationship to Run Twenty-Five

Run Twenty-Five already proved that selected MCP2 conformance decisions can be independently reproduced by the public clean-room implementation without MCPaios as a truth oracle.

This directory makes the evidence-availability boundary easier to inspect by presenting one small, human-readable reconstruction bundle instead of relying only on the frozen conformance corpus.
