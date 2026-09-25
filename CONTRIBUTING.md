# Contributing to MCP2

MCP2 welcomes reproducible bug reports, documentation corrections, independent
verification, and protocol proposals. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Choose the right channel

- Use the [bug report form](https://github.com/daytona3dan-coder/mcp2/issues/new?template=bug_report.yml)
  for non-sensitive defects. Include the exact commit, runtime, minimal input,
  command, expected result, and observed result.
- Use the [protocol proposal form](https://github.com/daytona3dan-coder/mcp2/issues/new?template=protocol_proposal.yml)
  for proposed semantic or conformance changes. Discuss substantial changes before implementation.
- Ask general questions in [Discussions](https://github.com/daytona3dan-coder/mcp2/discussions).
- Report suspected vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
  Do not put credentials, private tenant records, or exploitable security details in public issues.

## Preserve the protocol and its evidence

Read [CHARTER.md](CHARTER.md), [SPECIFICATION.md](SPECIFICATION.md),
[CONFORMANCE.md](CONFORMANCE.md), and the [Candidate freeze record](candidate/V0_8_CANDIDATE_FREEZE.md).

Candidate `0.8.0-candidate` is frozen at
`dc890456594e7d8f8eda92c4fa590800a8636942`. A later correction on `main` does not
retroactively change that commit or its qualification results. Describe whether
an issue affects the specification, reference code, clean-room code, an example,
or a separate operational implementation.

Preserve closed runs, historical PASS records, and the frozen predecessor vector
corpus. Add new evidence with its commit and scope instead of rewriting old
results. Propose normative changes explicitly for maintainer review and versioned
qualification; do not silently widen authority or change frozen semantics.

Maintain the [clean-room independence boundary](reference/clean-room/README.md).
MCPaios is a separate implementation, not the source of MCP2 protocol truth.
Evidence of one reconstructed decision does not establish general receipt
portability, receipt authenticity, or proof that an action executed.

## Development and verification

Fork this repository, create a focused branch from current `main`, and open a pull
request back to `main`. Node.js 20+ is required; CI uses Node.js 24. The commands
below use built-in Node modules and require no service credentials.

From the repository root, run the checks applicable to your change. For verifier
or protocol changes, run the full set below; the pull-request workflows also run
these qualification checks.

```sh
node --test candidate/protocol-freeze.test.mjs
node --test reference/test/*.test.js
node reference/src/run-vectors.js
node reference/clean-room/guard.mjs
node --test reference/clean-room/test.mjs
node reference/clean-room/v08-run-vectors.mjs
node reference/clean-room/run-vectors.mjs
node reference/clean-room/evidence-bindings.mjs
node examples/portable-reconstruction-v1/verify.mjs
node --test examples/portable-reconstruction-v1/verify.test.mjs
```

For a bug fix, supply a regression case that fails before the fix and passes
afterward. Include negative cases where relevant. For documentation-only work,
check links, paths, and commands; do not claim tests you did not run.

## Pull requests

Explain the problem, resulting behavior, affected protocol version/profile, and
compatibility implications. Include commands and results, exact evidence references,
and remaining limitations. Keep unrelated changes separate. Disclose AI assistance
when used and verify its output; generated text and passing tests do not constitute
human approval or independent review. Maintainer review determines acceptance.

Contributions are made under this repository's existing [Apache License 2.0](LICENSE).
Do not submit material you lack permission to contribute. This repository's license
does not grant rights to separately distributed MCPaios code or services.
