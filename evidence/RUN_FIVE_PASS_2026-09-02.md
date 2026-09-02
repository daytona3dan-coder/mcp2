# MCP2 Run Five — PASS

Date: 2026-09-02

## Claim proved

A real protected ChatVaultAI Desktop resource can be read only after a Desktop-owned MCP2 authority decision returns ALLOW. Denied requests do not reach the protected SQLite read path.

## Enforcement boundary

- Protected resource owner: ChatVaultAI Desktop
- Enforcement location: Tauri/Rust Desktop boundary
- Protected operation: read one vault item from the Desktop-owned local SQLite vault
- Authority model: canonical grant resolution inside Desktop
- Fail-closed production state: the live authority store starts empty
- No caller-facing command exists that can self-issue authority
- MCPaios is not given direct access to the ChatVaultAI vault database

## CI proof

The Run Five CI gate compiled the Desktop Rust library and executed the dedicated `run_five_` proof suite.

Result:

```text
running 16 tests
test result: ok. 16 passed; 0 failed; 0 ignored; 0 measured
```

## Cases proved

1. Human-ratified authority grant issuance
2. Exact authorized read succeeds against real SQLite
3. ALLOW receipt is generated and bound
4. Delegated child grant is issued within constraints
5. Child authorized read succeeds
6. Parent grant revocation produces a record
7. Child is denied after parent revocation without protected read
8. Expired grant is denied without protected read
9. Wrong target is denied without protected read
10. Wrong action is denied without protected read
11. Policy-digest mismatch is denied without protected read
12. Replay is denied without a second protected read
13. Unknown grant is denied without protected read
14. Malformed request is denied without protected read
15. ALLOW decision is reconstructible after nonce consumption
16. DENY decision is reconstructible

## Negative-path invariant

Every DENY proof case instruments the protected read and requires the read count to remain zero. The replay case additionally proves that a valid first read does not permit a second read with the same authority request nonce.

## What Run Five does not claim

Run Five does not claim that production MCPaios-to-Desktop authority synchronization is complete. The production Desktop authority store deliberately remains fail-closed until a separately governed synchronization mechanism is implemented and proven.

Run Five also does not claim enterprise identity federation, network transport security, or broad resource coverage beyond the protected Desktop read boundary under test.

## Verdict

**MCP2 RUN FIVE — PASS**

The machine-authority enforcement primitive is proven at a real protected resource boundary.
