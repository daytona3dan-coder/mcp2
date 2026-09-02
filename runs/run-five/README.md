# Run Five — ChatVaultAI Protected-Resource Proof

## Goal

Demonstrate that MCP2 authority is enforced at a protected resource boundary without giving MCPaios custody of the resource.

## Boundary

`Agent/MCP client → MCPaios → MCP2 VERIFY → execution fence → ChatVaultAI Desktop IPC → read-only resource`

MCPaios MUST NOT receive independent direct database access to the ChatVaultAI vault.

## Required cases

1. human-ratified grant issued
2. exact authorized read succeeds
3. ALLOW receipt generated
4. delegated child grant issued
5. child authorized read succeeds
6. parent revoked
7. child immediately denied
8. expired grant denied
9. wrong target denied
10. wrong action denied
11. altered policy digest denied
12. replayed request denied
13. unknown grant denied
14. malformed request denied
15. ALLOW decision reconstructed
16. DENY decision reconstructed

## Evidence requirements

For each case preserve:

- canonical grant(s)
- request
- verification timestamp
- verifier version
- decision
- reason codes
- request fingerprint
- grant fingerprint
- execution result fingerprint when applicable
- revocation record when applicable

## Pass rule

Run Five passes only if all expected decisions are deterministic and no protected read occurs on any DENY path.
