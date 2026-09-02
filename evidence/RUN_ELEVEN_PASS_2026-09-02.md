# MCP2 Run Eleven — Authenticated Identity and Bounded Delegation — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**External identity provider:** GitHub Actions OIDC  
**External protected system:** GitHub

## What Run Eleven proved

Run Eleven demonstrated the constitutional rule:

> **Identity is not authority.**

Cryptographic authentication establishes who a human or workload is. It does not itself permit machine execution. MCP2/MCPaios independently evaluates authority: the exact grant, actor, action, target, validity, delegation ancestry, and revocation state.

## Private MCPaios proof

Private MCPaios PR #3 merged at:

`88aec36b1ae8714c18ce5c1eb2971d4f94f565d3`

Accepted workflow run:

`33676064824`

The full regression suite reported:

- Run Eight: 16/16 PASS
- Run Ten: 16/16 PASS
- Run Eleven: 16/16 PASS
- Combined: **48/48 PASS, 0 failed**

Run Eleven then reran independently: **16/16 PASS, 0 failed**.

The private proof established:

1. valid human identity credential verification;
2. identity without authority DENY;
3. untrusted identity signer DENY;
4. wrong identity audience DENY;
5. expired identity DENY;
6. server-derived grant principal from verified human identity;
7. exact workload identity + grant ALLOW;
8. wrong workload identity DENY despite valid grant;
9. authenticated bounded child delegation;
10. no child action expansion;
11. no child target expansion;
12. no child validity expansion;
13. wrong authenticated workload cannot delegate another workload's grant;
14. child execution remains bounded to child scope;
15. parent revocation transitively invalidates child authority;
16. reconstruction links identity evidence, delegation, revocation, and decisions without storing raw identity credentials.

## Final live GitHub OIDC proof

Disposable proof repository: `daytona3dan-coder/mcp2-github-proof` (private)

Final accepted external proof PR:

`#10 — MCP2 Run Eleven — accepted deterministic GitHub OIDC gate`

Final accepted proof head:

`f41712346660551e52d284f6ac263534c53c7ea8`

Base `main` deterministic OIDC harness/workflow was installed before the accepted PR at:

`47082ab76157d460121ec41738a0ccfd82153c29`

Accepted OIDC workflow run:

`33677741356`

Final proof preservation merge:

`766cd6ee45237949397e984f9e8252efda161874`

Final result: **RUN ELEVEN OIDC PASS 10/10**.

The workflow requested a real GitHub Actions OIDC JWT and cryptographically verified it against GitHub's live OpenID configuration and JWKS.

The verified GitHub workload subject was:

`repo:daytona3dan-coder@244063891/mcp2-github-proof@1355104393:pull_request`

The subject binds immutable GitHub owner ID `244063891` and repository ID `1355104393`.

A separately Ed25519-signed MCP2 proof grant bound its actor to that exact GitHub OIDC subject. The proof-only MCP2 private signing key was never committed.

## Final external proof transcript

1. Live GitHub OIDC JWT signature verified against GitHub JWKS — PASS.
2. OIDC claims bound immutable repository identity and the exact pull-request workload subject — PASS.
3. Authenticated workload identity without MCP2 authority — DENY before mutation.
4. Separately signed MCP2 grant verified and bound the exact OIDC subject — PASS.
5. Exact OIDC identity + exact grant — ALLOW; real GitHub repository read succeeded.
6. `github.contents.write` — DENY even though the workflow token possessed `contents: write` capability; zero mutation calls.
7. Different authenticated workload subject could not inherit the grant — DENY.
8. Valid GitHub OIDC token with the wrong audience — DENY.
9. Deterministically tampered GitHub OIDC payload failed cryptographic signature verification — DENY.
10. Evidence reconstructed identity → authority → decision without storing the raw JWT — PASS.

Every denied mutation path recorded zero GitHub mutation calls.

## Final evidence artifact

Artifact: `mcp2-run-eleven-oidc-evidence`

Artifact ID: `9864998969`

Artifact ZIP SHA-256 reported by GitHub Actions:

`569763b2c27a665b4e265a1a035d07cea3c4dfdbf6cad9f28d2d10a1fb354460`

The evidence stores selected OIDC claims and a SHA-256 fingerprint of the JWT. The raw JWT is not preserved.

## Superseded external attempts and correction history

Earlier OIDC proof attempts were deliberately retained as engineering evidence but are **not** the final Run Eleven acceptance record.

An earlier identity-binding attempt failed closed when the assumed GitHub OIDC subject did not match the repository-customized subject actually issued by GitHub. The grant was then bound to the exact observed subject containing immutable owner and repository IDs.

A later 10/10 supporting run used a tamper test that changed the final base64url signature character. Because unused base64url bits can make such a textual change decode to identical signature bytes, that test could be nondeterministic. The proof was therefore strengthened rather than accepted on that basis: the final harness mutates the JWT payload bytes while retaining the original signature, guaranteeing cryptographic verification failure.

PRs #8 and #9 were closed unmerged during this correction sequence. Final acceptance uses PR #10, opened only after the deterministic harness was installed on base `main`, and workflow run `33677741356` explicitly executed `proof/run-eleven-oidc-final.mjs` and passed all ten cases.

## Capability versus identity versus authority

The accepted GitHub workflow possessed:

- a cryptographically verifiable GitHub workload identity;
- GitHub `contents: write` technical capability.

Neither fact granted write authority.

The MCP2 grant authorized only `github.read`, so `github.contents.write` remained DENY and no mutation call occurred.

This demonstrates three distinct layers:

1. **Identity:** who is the workload?
2. **Capability:** what can the GitHub token technically do?
3. **Authority:** what is this authenticated workload permitted to do now?

## Bounded delegation

The private MCPaios proof also demonstrated authenticated workload-to-workload delegation. Child grants could not exceed parent actions, targets, or validity. A child could not be delegated by the wrong workload identity. Revoking the parent caused descendant execution to fail through invalid ancestry.

## Security significance

Run Eleven extends the established chain to:

`Authenticated Identity → MCP2 Authority → Execution`

It proves that an identity provider can authenticate a principal/workload without becoming the authority system itself.

## Non-claims

Run Eleven does not claim:

- production enterprise identity federation;
- organization-wide GitHub OIDC subject-policy rollout;
- HSM-backed production identity or authority keys;
- generalized identity adapters for every cloud/workload provider;
- production MCPaios network deployment.

Run Eleven proves the narrower critical property that **authenticated identities can be cryptographically bound to bounded, delegable, revocable MCP2 authority while identity itself remains non-authoritative.**
