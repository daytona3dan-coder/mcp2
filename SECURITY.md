# Security Policy

## Scope and versions

This policy covers the MCP2 specification, schemas, reference and clean-room
verifiers, and examples in this repository. Reports concerning current `main` and
Candidate `0.8.0-candidate` are welcome. Include the exact commit: the frozen
Candidate is `dc890456594e7d8f8eda92c4fa590800a8636942`, while `main` may contain
later corrections.

Earlier Candidates and closed run records are preserved historical evidence.
Reports about them are useful when they affect current behavior, but historical
artifacts are not silently rewritten and no backport schedule is promised.
MCPaios and other deployed products have separate operational configurations;
a repository finding alone does not establish a production vulnerability.

## Report a vulnerability privately

Email **daytona3dan@yahoo.com** with the subject **MCP2 security report**.
Please do not disclose suspected exploitable vulnerabilities in public issues,
discussions, or pull requests before coordination with the maintainer.

Include, when available:

- Affected commit, version/profile, file, runtime, and operating system.
- The expected authority or evidence boundary and how it could be violated.
- Minimal reproduction steps and sanitized inputs or a proof of concept.
- Expected versus observed results, impact, and relevant limitations.
- A proposed fix or workaround, if you have one, and your credit preference.

Do not send passwords, API keys, operational secrets, private tenant data, or
unnecessary personal information. Use local test fixtures and systems you are
authorized to test. This policy does not authorize testing third-party or hosted
systems.

## Handling and disclosure

The maintainer will review reports and coordinate reproduction, impact assessment,
remediation, and disclosure with the reporter. Response and resolution times depend
on availability and complexity; this project does not promise a fixed response
window, a security audit, or a bounty. If you have not received a response, follow
up on the same email thread.

Corrections should identify affected commits and the scope of supporting tests.
Historical qualification records remain tied to their original commits. Please
coordinate public disclosure so a correction or mitigation can be communicated
alongside the finding. Reporter credit will be discussed before publication.

For non-sensitive bugs and proposals, use the public issue forms. For conduct
concerns, see [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
