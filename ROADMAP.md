# MCP2 Roadmap

## Historical program

The original authority-core program produced the frozen MCP2 Candidate v0.7.0 and the closed Runs Five through Twenty-Five proof corpus.

Those proof records remain historical evidence and are not rewritten by later protocol work.

## Current Gate A — v0.8 protocol reconciliation

Status: **COMPLETE — CANDIDATE v0.8.0 FROZEN**

Reconcile the public normative specification, schemas, algorithms, reference verifier, clean-room verifier, and conformance vectors for:

- explicit delegation permission;
- delegated principal equality;
- delegated policy-digest equality;
- superseded non-executable authority;
- declared implementation request extensions;
- continued separation between Core replay nonce and implementation-specific attempt identity.

Exit achieved: exact-head review, green public Candidate qualification, and Candidate v0.8.0 freeze.

## Current Gate B — MCPaios product alignment

Status: **IN DEVELOPMENT in the private MCPaios repository**

Bring durable product issuance, last-moment verification, lifecycle representation, request-extension validation, reconstruction, tests, and database qualification into exact agreement with the frozen v0.8 Candidate.

Production deployment remains a separate owner-authorized gate.

## Current Gate C — PayMAXAIOS governed paid execution

Status: **DESIGN DEPENDENCY — do not move money inside MCP2**

Prove one paid protected action where:

1. PayMAXAIOS quotes and atomically reserves financial capacity;
2. the target validates the exact reservation;
3. MCPaios performs the decisive authority verification at the last responsible moment;
4. DENY prevents execution and releases the financial hold;
5. ALLOW permits target-owned execution;
6. completion evidence drives PayMAXAIOS settlement, release, or unresolved reconciliation;
7. authority and financial evidence remain linked without either system becoming the other's source of truth.

## Current Gate D — Spec Kit bridge

Status: **PLANNED**

Current GitHub Spec Kit provides specifications, resumable workflows, human gates, slots, overlays, and agent integrations, but its workflow shell execution is not a capability sandbox.

The bridge therefore remains:

`Spec Kit artifact/workflow → bounded authority proposal → human/governed ratification → MCPaios fence → target execution`

A Spec Kit task, gate, workflow result, skill, completion claim, or integration credential MUST NOT itself become MCP2 authority.

## External interoperability watch

Track final/stable and proposal-stage developments in MCP, including extensions, Tasks, Skills, enterprise authorization, structured denials, audit/evidence, approval, and execution-attestation work.

External protocols are interoperability inputs. MCP2 does not silently inherit proposal-stage semantics.
