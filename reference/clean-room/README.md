# MCP2 Clean-Room Verifier — Run Twenty-Five

This directory is an independent conformance implementation for MCP2 Run Twenty-Five.

## Independence boundary

The verifier:

- lives only in the public `mcp2` repository;
- imports only Node's built-in `node:crypto` module;
- does not import the existing MCP2 reference verifier;
- does not import, connect to, or call MCPaios;
- does not connect to Supabase, Vault, GitHub APIs, Drive, Stripe, or Dropbox at verification time;
- consumes only explicit bundle inputs and public conformance vectors.

The HMAC vectors use the deliberately public test key recorded in `vectors.json.gz`. They do not use or claim access to any operational MCPaios/Vault secret.

## Covered semantics

The clean-room implementation independently evaluates:

- bounded grant verification;
- ancestor/delegation invalidation;
- expiry and replay;
- receipt hashing and authority binding;
- authenticated witness freshness and maximum staleness;
- current vs retired/compromised freshness-root eligibility;
- root rollback/resurrection attempts;
- 2-of-N timestamp-provider membership;
- current vs historical provider epochs;
- provider rollback/resurrection/rejoin/qualification rules;
- PRE/POST external timestamp threshold classification.

The vector suite is grounded back to closed public proof records by `evidence-bindings.mjs`.

## Run

```text
node guard.mjs
node --test test.mjs
node run-vectors.mjs
node evidence-bindings.mjs
```

A PASS means the public clean-room code reproduces the expected conformance outcomes without consulting MCPaios. It does not mean every implementation-specific transport/storage mechanism from Runs Five–Twenty-Four has been reimplemented.
