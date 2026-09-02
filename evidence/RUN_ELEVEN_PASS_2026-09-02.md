# MCP2 Run Eleven — Authenticated Identity and Bounded Delegation — PASS

**Date:** 2026-09-02  
**Verdict:** PASS  
**External identity provider:** GitHub Actions OIDC  
**External protected system:** GitHub

## What Run Eleven proved

Run Eleven demonstrated the constitutional rule:

> **Identity is not authority.**

Cryptographic authentication establishes who a human or workload is. It does not itself permit machine execution. MCP2/MCPaios independently evaluates the authority grant, action, target, validity, delegation chain and revocation state.

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
16. reconstruction links identity evidence, delegation, revocation and decisions without storing raw identity credentials.

## Live GitHub OIDC proof

Disposable proof repository: `daytona3dan-coder/mcp2-github-proof` (private)

External proof PR: #7

Proof preservation merge:

`dc98affa81692627887453ba618de6ed2dfd174a`

Accepted OIDC workflow run:

`33676840074`

Accepted proof head:

`ac345d8d1e5b6b1cc26b6027c21c1f63c9d27060`

Final result: **RUN ELEVEN OIDC PASS 10/10**.

The workflow requested a real GitHub Actions OIDC JWT and cryptographically verified it against GitHub's live OpenID configuration and JWKS.

The verified GitHub workload subject was:

`repo:daytona3dan-coder@244063891/mcp2-github-proof@1355104393:pull_request`

The subject includes immutable GitHub owner ID `244063891` and repository ID `1355104393`.

A separately Ed25519-signed MCP2 proof grant bound its actor to that exact GitHub OIDC subject. The proof-only MCP2 private signing key was never committed.

## External proof transcript

1. Live GitHub OIDC JWT signature verified against GitHub JWKS — PASS.
2. OIDC claims bound the immutable repository identity and exact pull-request workload subject — PASS.
3. Authenticated workload identity without an MCP2 grant — DENY.
4. Separately signed MCP2 grant verified and bound the exact OIDC subject — PASS.
5. Exact OIDC identity + exact grant — ALLOW; real GitHub repository read succeeded.
6. `github.contents.write` — DENY even though the workflow token possessed `contents: write` capability.
7. Different workload subject could not inherit the grant — DENY.
8. Valid GitHub OIDC token with the wrong audience — DENY.
9. Tampered GitHub OIDC token failed cryptographic signature verification — DENY.
10. Evidence reconstructed identity → authority → decision without storing the raw JWT — PASS.

Every denied mutation path recorded zero GitHub mutation calls.

## Evidence artifact

Artifact: `mcp2-run-eleven-oidc-evidence`

Artifact ID: `9864666766`

Artifact ZIP SHA-256 reported by GitHub Actions:

`ef9916814fe9bda9f66a51e62ffb58148ec3a9e7d8a8c999e2430272e5116048`

The artifact stores selected OIDC claims and a SHA-256 fingerprint of the JWT. The raw JWT is not preserved in the evidence artifact.

## Failed external attempts and correction

The first OIDC proof assumed GitHub's default pull-request subject form. GitHub returned a different repository-customized subject, so the workflow correctly failed with `OIDC_SUBJECT_MISMATCH` rather than accepting a looser identity binding.

A diagnostic run printed only safe OIDC claims and revealed the actual subject containing immutable owner and repository IDs. The proof grant was re-issued against that exact subject, the diagnostic helper was removed, and a fresh final head was executed.

The final accepted head `ac345d8d1e5b6b1cc26b6027c21c1f63c9d27060` passed all 10 external cases. The failed diagnostic attempts are not accepted as Run Eleven evidence.

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

The private MCPaios proof also demonstrated authenticated workload-to-workload delegation. Child grants could not exceed parent actions, targets or validity. A child could not be delegated by the wrong workload identity. Revoking the parent caused descendant execution to fail with an invalid-ancestor decision.

## Security significance

Run Eleven extends the established chain to:

`Authenticated Identity → MCP2 Authority → Execution`

It proves that identity providers can authenticate principals/workloads without becoming the authority system themselves.

## Non-claims

Run Eleven does not claim:

- production enterprise identity federation;
- organization-wide GitHub OIDC subject-policy rollout;
- HSM-backed production identity or authority keys;
- generalized identity adapters for every cloud/workload provider;
- production MCPaios network deployment.

Run Eleven proves the narrower critical property that **authenticated identities can be cryptographically bound to bounded, delegable, revocable MCP2 authority while identity itself remains non-authoritative.**
